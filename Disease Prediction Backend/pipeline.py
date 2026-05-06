from os import path
import joblib
import pandas as pd

BASE_PATH = path.join(path.dirname(__file__), "models")

model_cat = joblib.load(path.join(BASE_PATH, "category_model.pkl"))
features_cat = joblib.load(path.join(BASE_PATH, "features.pkl"))

model_dis = joblib.load(path.join(BASE_PATH, "disease_model_final.pkl"))
features_dis = joblib.load(path.join(BASE_PATH, "features_disease.pkl"))

category_map = joblib.load(path.join(BASE_PATH, "category_map.pkl"))
category_disease_map = joblib.load(path.join(BASE_PATH, "category_disease_map.pkl")) 


def get_season(m):
    if m in [12, 1, 2]:
        return 0
    elif m in [3, 4, 5]:
        return 1
    elif m in [6, 7, 8, 9]:
        return 2
    else:
        return 3


def create_features(df):
    df['AQI_scaled'] = df['AQI'] / 300

    df['extreme_heat'] = (df['Temp_C'] > 40).astype(int)
    df['dry_heat'] = ((df['Temp_C'] > 35) & (df['Humidity_Pct'] < 40)).astype(int)
    df['high_uv'] = (df['UV_Index'] > 8).astype(int)
    df['aqi_bad'] = (df['AQI'] > 120).astype(int)

    df['vector_condition'] = (
        (df['Humidity_Pct'] > 65) &
        (df['Rainfall_mm'] > 50) &
        (df['UV_Index'] < 9) &
        (df['Wind_Speed_kph'] < 20)
    ).astype(int)

    df['low_mosquito'] = (
        (df['Humidity_Pct'] < 40) &
        (df['Rainfall_mm'] < 20)
    ).astype(int)

    df['cold_condition'] = (df['Temp_C'] <= 20).astype(int)

    df['season'] = df['Month'].apply(get_season)

    return df


def apply_category_constraint(prob_dict, category):
    allowed = category_disease_map.get(category, [])
    filtered = {d: p for d, p in prob_dict.items() if d in allowed}

    total = sum(filtered.values())
    if total > 0:
        filtered = {k: v / total for k, v in filtered.items()}

    return filtered

def predict_category(input_data):

    df = pd.DataFrame([input_data])
    df = create_features(df)

    for col in features_cat:
        if col not in df.columns:
            df[col] = 0

    X = df[features_cat].fillna(0)

    probs = model_cat.predict_proba(X)[0]
    classes = model_cat.classes_

    prob_dict = dict(zip(classes, probs))


    if 'Cold-related' in classes:
        if df['cold_condition'].iloc[0] == 0:
            idx = list(classes).index('Cold-related')
            probs[idx] = 0.2
            prob_dict = dict(zip(classes, probs))

    best_class = max(prob_dict, key=prob_dict.get)
    best_conf = prob_dict[best_class] * 100


    if 0 < best_conf < 1:
      best_conf = 1.0

    best_conf = round(best_conf, 2)

   
    if best_conf <= 35:
        return "Normal / No Disease Risk", best_conf, prob_dict

    return best_class, best_conf, prob_dict


def predict_disease(input_data, category):

    df = pd.DataFrame([input_data])
   
    if category not in category_map:
        return "Unknown", 0

    df['Category_encoded'] = category_map[category]
    df['season'] = df['Month'].apply(get_season)
    df['high_humidity'] = (df['Humidity_Pct'] > 70).astype(int)
    df['heavy_rain'] = (df['Rainfall_mm'] > 100).astype(int)
    df['poor_air'] = (df['AQI'] > 100).astype(int)

    X = df[features_dis]

    prob = model_dis.predict_proba(X)[0]
    classes = model_dis.classes_
    print("Classes:", classes)
    prob = prob + 1e-6
    prob = prob / prob.sum()

    prob_dict = dict(zip(classes, prob))
     
  
    temp = input_data['Temp_C']
    rain = input_data['Rainfall_mm']
    humidity = input_data['Humidity_Pct']
    aqi = input_data['AQI']
    rain = input_data['Rainfall_mm']
    uv = input_data['UV_Index']
    wind=input_data['Wind_Speed_kph']



    if temp < 22:
      if 'Cold' in prob_dict:
        prob_dict['Cold'] *= 1.15

    if temp < 18 and humidity > 70:
      if 'Cold' in prob_dict:
        prob_dict['Cold'] *= 1.1

    if temp < 12 and wind > 15:
       if 'Hypothermia' in prob_dict:
         prob_dict['Hypothermia'] *= 1.3

    if temp < 10 and wind > 10 and humidity > 80:
       if 'Hypothermia' in prob_dict:
         prob_dict['Hypothermia'] *= 1.20




    if temp < 20:
      for d in ['Viral Fever', 'Influenza', 'Asthma']:
        if d in prob_dict:
            prob_dict[d] *= 1.2

    if 'Cold' in prob_dict:
        prob_dict['Cold'] *= 0.8



    if temp > 38:
     for d in ['Heatstroke', 'Dehydration']:
        if d in prob_dict:
            prob_dict[d] *= 1.2

    if rain > 80 and humidity > 70:
      for d in ['Dengue', 'Malaria', 'Chikungunya']:
        if d in prob_dict:
            prob_dict[d] *= 1.2


    if aqi > 150:
      if 'Asthma' in prob_dict:
        prob_dict['Asthma'] *= 1.2
      if 'Influenza' in prob_dict:
        prob_dict['Influenza'] *= 1.1


    if rain > 40 and temp < 30:
     if 'Viral Fever' in prob_dict:
        prob_dict['Viral Fever'] *= 1.05

     if 'Cold' in prob_dict:
        prob_dict['Cold'] *= 1.1

  
    total = sum(prob_dict.values())
    prob_dict = {k: v / total for k, v in prob_dict.items()}

    print("\n--- RAW MODEL PROBABILITIES ---")  
    for k, v in prob_dict.items():
      print(f"{k}: {round(v*100, 2)}%")

    prob_dict = apply_category_constraint(prob_dict, category)

    final_disease = max(prob_dict, key=prob_dict.get)
    final_prob = float(prob_dict[final_disease] * 100)

    return final_disease, final_prob



disease_severity = {
    "Dehydration": "Medium",
    "Heatstroke": "High",
    "Viral Fever": "Low",
    "Influenza": "Medium",
    "Asthma": "High",
    "Dengue": "High",
    "Malaria": "High",
    "Chikungunya": "High",
    "Cold": "Low",
    "Hypothermia": "High"
}

disease_cause = {
    "Dehydration": "High temperature and low water loss imbalance",
    "Heatstroke": "Extreme heat exposure",
    "Viral Fever": "Weather fluctuation and viral infection spread",
    "Influenza": "Poor air quality and seasonal viral infection",
    "Asthma": "High AQI or polluted air exposure",
    "Dengue": "High rainfall and mosquito breeding conditions",
    "Malaria": "Stagnant water and humidity",
    "Chikungunya": "Monsoon mosquito breeding conditions",
    "Cold": "Low temperature exposure",
    "Hypothermia": "Prolonged cold exposure and wind chill"
}
def compute_risk(disease, prob):
    severity_score = {
        "Low": 1,
        "Medium": 2,
        "High": 3
    }

    sev = disease_severity.get(disease, "Medium")


    score = (prob / 100) * 0.6 + (severity_score[sev] / 3) * 0.4

    if score >= 0.75:
        return "High"
    elif score >= 0.45:
        return "Medium"
    else:
        return "Low"

def full_pipeline(input_data):

    category, cat_prob, _ = predict_category(input_data)

    if category == "Normal / No Disease Risk":
       return {
        "category": category,
        "category_prob": round(cat_prob, 2),
        "status": "Safe",
        "disease": None,
        "disease_prob": None,
        "risk_level": None,
        "cause": None
    }

    disease, dis_prob = predict_disease(input_data, category)

    risk = compute_risk(disease, dis_prob)

    cause = disease_cause.get(disease, "Environmental and weather-based conditions")

    return {
        "category": category,
        "disease": disease,
        "disease_prob": round(dis_prob, 2),
        "risk_level": risk,
        "cause": cause
    }
