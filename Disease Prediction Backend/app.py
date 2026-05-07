from os import path
from flask import Flask, request, jsonify, render_template
import requests
from pipeline import full_pipeline
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dotenv import load_dotenv
import os


app = Flask(__name__)

BASE_DIR = path.abspath(path.dirname(__file__))
DB_PATH = path.join(BASE_DIR, "app.db")



app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)
class Predictions(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)

    city = db.Column(db.String(100))

    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    rainfall = db.Column(db.Float)
    aqi = db.Column(db.Float)

   
    category = db.Column(db.String(50))
    disease = db.Column(db.String(100))
    disease_prob = db.Column(db.Float)
    risk_level = db.Column(db.String(20))
    cause = db.Column(db.String(255))

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(255))
    role = db.Column(db.String(50))
    city = db.Column(db.String(100)) 

class Prediction(db.Model):
    __tablename__ = "prediction"

    id = db.Column(db.Integer, primary_key=True)

    city = db.Column(db.String(100))
    temp_c = db.Column(db.Float)
    humidity = db.Column(db.Float)
    aqi = db.Column(db.Float)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class WeatherData(db.Model):
    __tablename__ = "weather_data"

    id = db.Column(db.Integer, primary_key=True)

    city = db.Column(db.String(100), nullable=False)

    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    rainfall = db.Column(db.Float)
    aqi = db.Column(db.Float)

    source = db.Column(db.String(20))

    created_at = db.Column(db.DateTime, default=datetime.utcnow) 

class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(255))
    city = db.Column(db.String(100))
    type = db.Column(db.String(50))
    disease = db.Column(db.String(100))
    message = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PredictionReport(db.Model):
    __tablename__ = "prediction_report"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer)
    city = db.Column(db.String(100))

    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    rainfall = db.Column(db.Float)
    aqi = db.Column(db.Float)

    category = db.Column(db.String(50))
    disease = db.Column(db.String(100))
    risk_level = db.Column(db.String(50))
    probability = db.Column(db.Float)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)    
class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    action = db.Column(db.String(100))   
    city = db.Column(db.String(100))
    details = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

 
load_dotenv()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

@app.route("/")
def home():
    return "Backend Running Successfully"

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    existing_user = User.query.filter_by(email=data.get("email")).first()

    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    new_user = User(
        username=data.get("username"),
        email=data.get("email"),
        password=data.get("password"),
        role=data.get("role"),
        city=data.get("city")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    ADMIN_EMAIL = "admin@gmail.com"
    ADMIN_PASSWORD = "admin@123"

   
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:

        log = ActivityLog(
            user_id=0,
            action="LOGIN",
            city="Admin",
            details="Admin logged in"
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "message": "Admin login successful",
            "role": "Admin",
            "user_id": 0
        }), 200

   
    user = User.query.filter_by(email=email, password=password).first()

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    if role == "Admin":
        return jsonify({"message": "Invalid admin credentials"}), 401


    log = ActivityLog(
        user_id=user.id,
        action="LOGIN",
        city=user.city,
        details=f"{user.email} logged in"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Login successful",
        "role": user.role,
        "user_id": user.id
    }), 200


@app.route("/user-dashboard", methods=["GET"])
def user_dashboard():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    cities = db.session.query(Predictions.city)\
        .filter_by(user_id=user_id)\
        .distinct().all()

    cities = [c[0] for c in cities if c[0]]

    results = []

    for city in cities:
        try:
            url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"
            res = requests.get(url)
            data = res.json()
            current = data["current"]

            pm25 = current.get("air_quality", {}).get("pm2_5", 0)
            aqi = pm25 * 2

            results.append({
                "city": city,
                "aqi": aqi,
                "temp": current["temp_c"],
                "risk": "Critical" if aqi > 200 else "High" if aqi > 100 else "Low"
            })

        except Exception as e:
            print("error:", e)

    return jsonify(results)

@app.route("/activity-logs", methods=["GET"])
def activity_logs():

    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).all()

    return jsonify([
        {
            "user_id": log.user_id,
            "action": log.action,
            "city": log.city,
            "details": log.details,
            "time": log.timestamp.strftime("%d %b %Y %H:%M")
        }
        for log in logs
    ])

@app.route("/save-weather", methods=["POST"])
def save_weather():

    data = request.get_json()
    city = data.get("city")

    
    url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"
    res = requests.get(url)
    current = res.json()["current"]

    
    pm25 = current.get("air_quality", {}).get("pm2_5", 0)
    aqi_value = pm25 * 2

    
    new_entry = Prediction(
        city=city,
        temp_c=current["temp_c"],
        humidity=current["humidity"],
        aqi=aqi_value
    )

    db.session.add(new_entry)
    db.session.commit()

    return jsonify({
        "message": "Saved successfully",
        "data": {
            "temp_c": current["temp_c"],
            "humidity": current["humidity"],
            "aqi": aqi_value,
            "timestamp": new_entry.timestamp,
            "city": city
        }
    })

@app.route("/live-weather", methods=["GET"])
def live_weather():

  
    cities = db.session.query(Predictions.city).distinct().all()
    cities = [c[0] for c in cities if c[0]]  

    results = []

    for city in cities:

        try:
            url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"
            res = requests.get(url, timeout=5)

            data = res.json()
            current = data["current"]

            pm25 = current.get("air_quality", {}).get("pm2_5", 0)

            ml_input = {
                "Temp_C": current["temp_c"],
                "Humidity_Pct": current["humidity"],
                "Rainfall_mm": current["precip_mm"],
                "AQI": pm25 * 2,
                "Month": datetime.now().month,
                "Wind_Speed_kph": current["wind_kph"],
                "UV_Index": current["uv"],
                "city": city
            }

            result = full_pipeline(ml_input)

          
            if result["risk_level"] in ["High", "Critical"]:

                alert_type = "Critical" if result["risk_level"] == "Critical" else "Warning"

                alert = Alert(
                    title=f"{alert_type} Health Alert",
                    city=city,
                    type=alert_type,
                    disease=result["disease"],
                    message=f"{result['disease']} risk is {result['risk_level']} in {city}"
                )

                db.session.add(alert)

            results.append({
                "city": city,
                "temperature": current["temp_c"],
                "humidity": current["humidity"],
                "rainfall": current["precip_mm"],
                "aqi": pm25 * 2,
                "disease": result["disease"],
                "risk_level": result["risk_level"]
            })

        except Exception as e:
            print(f"Error for {city}: {e}")

    db.session.commit()

    return jsonify(results)

@app.route("/alerts-city", methods=["GET"])
def alertsCity():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    
    cities = db.session.query(Predictions.city)\
        .filter_by(user_id=user_id)\
        .distinct().all()

    cities = [c[0] for c in cities if c[0]]

    results = []

    for city in cities:
        try:
          
            clean_city = city.split(",")[0]

            url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={clean_city}&aqi=yes"
            res = requests.get(url, timeout=5)

            data = res.json()
            current = data["current"]

            pm25 = current.get("air_quality", {}).get("pm2_5", 0)
            aqi_value = pm25 * 2

            new_entry = WeatherData(
                city=city, 
                temperature=current["temp_c"],
                humidity=current["humidity"],
                rainfall=current["precip_mm"],
                aqi=aqi_value,
                source="live"
            )
            db.session.add(new_entry)

           
            results.append({
                "city": city,
                "temperature": current["temp_c"],
                "humidity": current["humidity"],
                "rainfall": current["precip_mm"],
                "aqi": aqi_value,
                "source": "live"
            })

        except Exception as e:
            print(f"API failed for {city}: {e}")

            last = WeatherData.query.filter_by(city=city)\
                .order_by(WeatherData.id.desc())\
                .first()

            if last:
                results.append({
                    "city": city,
                    "temperature": last.temperature,
                    "humidity": last.humidity,
                    "rainfall": last.rainfall,
                    "aqi": last.aqi,
                    "source": "cache"
                })
            else:
                results.append({
                    "city": city,
                    "temperature": None,
                    "humidity": None,
                    "rainfall": None,
                    "aqi": None,
                    "source": "no-data"
                })

    db.session.commit()

    return jsonify(results)


@app.route("/history/delete/<int:prediction_id>", methods=["DELETE"])
def delete_history(prediction_id):
    record = Predictions.query.get(prediction_id)

    if not record:
        return jsonify({"message": "Record not found"}), 404

    db.session.delete(record)
    db.session.commit()

    return jsonify({"message": "Deleted successfully"}), 200

@app.route("/predictions-table")
def predictions_table():

    records = Predictions.query.order_by(Predictions.timestamp.desc()).all()

    return jsonify([
        {
            "date": r.timestamp.strftime("%d %b"),
            "city": r.city,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "aqi": r.aqi,
            "category": r.category,
            "disease": r.disease,
            "risk_level": r.risk_level,
            "probability": r.disease_prob
        }
        for r in records
    ])

@app.route("/predict", methods=["POST"])
def predict():
    input_data = request.get_json()

    city = input_data.get("city")
    user_id = input_data.get("user_id")

    
    url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"
    res = requests.get(url)
    data = res.json()

    current = data["current"]

    
    pm25 = current.get("air_quality", {}).get("pm2_5", 0)
    aqi_value = pm25 * 2

    
    ml_input = {
        "Temp_C": current["temp_c"],
        "Humidity_Pct": current["humidity"],
        "Rainfall_mm": current["precip_mm"],
        "AQI": aqi_value,
        "Month": datetime.now().month,
        "Wind_Speed_kph": current["wind_kph"],
        "UV_Index": current["uv"],
        "city": city
    }

    result = full_pipeline(ml_input)

    
    new_entry = Predictions(
        user_id=user_id,
        city=city,
        temperature=current["temp_c"],
        humidity=current["humidity"],
        rainfall=current["precip_mm"],
        aqi=aqi_value,
        category=result["category"],
        disease=result["disease"],
        disease_prob=result["disease_prob"],
        risk_level=result["risk_level"],
        cause=result["cause"]
    )

    db.session.add(new_entry)

    
    log = ActivityLog(
        user_id=user_id,
        action="PREDICT",
        city=city,
        details=f"{result['disease']} ({result['risk_level']})"
    )

    db.session.add(log)

  
    db.session.commit()

    return jsonify(result)

@app.route("/weather", methods=["POST"])
def weather():

    data = request.get_json()

    city = data.get("city")
    lat = data.get("lat")
    lon = data.get("lon")
    user_id = data.get("user_id")

   
    if lat and lon:
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={lat},{lon}&aqi=yes"

    
    else:
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"

    res = requests.get(url)
    data = res.json()

    current = data["current"]
    location = data["location"]

    
    full_location = f"{location['name']}, {location.get('region','')}, {location['country']}"

    pm25 = current.get("air_quality", {}).get("pm2_5", 0)
    aqi_value = pm25 * 2

    ml_input = {
        "Temp_C": current["temp_c"],
        "Humidity_Pct": current["humidity"],
        "Rainfall_mm": current["precip_mm"],
        "AQI": aqi_value,
        "Month": datetime.now().month,
        "Wind_Speed_kph": current["wind_kph"],
        "UV_Index": current["uv"],
        "city": full_location
    }

    result = full_pipeline(ml_input)

    new_entry = Predictions(
        user_id=user_id,
        city=full_location,
        temperature=current["temp_c"],
        humidity=current["humidity"],
        rainfall=current["precip_mm"],
        aqi=aqi_value,
        category=result["category"],
        disease=result["disease"],
        disease_prob=result["disease_prob"],
        risk_level=result["risk_level"],
        cause=result["cause"]

    )
    log = ActivityLog(
    user_id=user_id,
    action="PREDICT",
    city=full_location,
    details=f"{result['disease']} ({result['risk_level']})"
)



    db.session.add(new_entry)
    db.session.add(log)
    db.session.commit()

    return jsonify({
        **result,
        "location": full_location,
        "lat": lat,
        "lon": lon
    })
@app.route("/user/download-report", methods=["GET"])
def user_download_report():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    predictions = Predictions.query\
        .filter_by(user_id=user_id)\
        .order_by(Predictions.timestamp.desc())\
        .all()

    result = []

    for p in predictions:
        result.append({
            "date": p.timestamp.strftime("%d %b"),
            "city": p.city,
            "temperature": p.temperature,
            "humidity": p.humidity,
            "aqi": p.aqi,
            "category": p.category,
            "disease": p.disease,
            "risk_level": p.risk_level,
            "probability": p.disease_prob
        })

    return jsonify(result)

@app.route("/history", methods=["GET"])
def history():
    user_id = request.args.get("user_id")

    records = Predictions.query.filter_by(user_id=user_id)\
        .order_by(Predictions.id.desc()).all()

    return jsonify([
        {
            "id": r.id,   
            "city": r.city,
            "title": r.disease,
            "level": r.risk_level,
            "description": r.cause,
            "confidence": r.disease_prob
        }
        for r in records
    ])


@app.route("/environment/user-city", methods=["GET"])
def environment_user_city():

    user_id = request.args.get("user_id")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    
    if lat and lon:
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={lat},{lon}&aqi=yes"
    else:
        user = User.query.get(user_id)
        if not user or not user.city:
            return jsonify({"error": "City not found"}), 404

        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={user.city}&aqi=yes"

    res = requests.get(url)
    data = res.json()

    current = data["current"]
    location = data["location"]

   
    pm25 = current.get("air_quality", {}).get("pm2_5", 0)
    aqi = pm25 * 2

    env_data = {
        "city": f"{location['name']}, {location['country']}",
        "temperature": current["temp_c"],
        "humidity": current["humidity"],
        "rainfall": current["precip_mm"],
        "wind_speed": current["wind_kph"],
        "uv_index": current["uv"],
        "aqi": aqi
    }

    
    ml_input = {
        "Temp_C": current["temp_c"],
        "Humidity_Pct": current["humidity"],
        "Rainfall_mm": current["precip_mm"],
        "AQI": aqi,
        "Month": datetime.now().month,
        "Wind_Speed_kph": current["wind_kph"],
        "UV_Index": current["uv"],
        "city": location["name"]
    }

    
    try:
        result = full_pipeline(ml_input)

        prediction = {
            "disease": result["disease"],
            "risk_level": result["risk_level"],
            "cause": result["cause"],
            "probability": result["disease_prob"]
        }

    except Exception as e:
        prediction = {
            "disease": "Unknown",
            "risk_level": "Unknown",
            "cause": "Model error",
            "probability": 0
        }

    
    return jsonify({
        "environment": env_data,
        "prediction": prediction
    })

@app.route("/user-activity", methods=["GET"])
def user_activity():

    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).all()

    result = []

    for log in logs:
        user = User.query.get(log.user_id)

        result.append({
            "user_id": log.user_id,
            "username": user.username if user else "Admin",
            "email": user.email if user else "Admin",
            "user_city": user.city if user else "-",

            "action": log.action,
            "city": log.city,
            "details": log.details,

            "time": log.timestamp.strftime("%d %b %Y %H:%M")
        })

    return jsonify(result)

@app.route("/environment/cities", methods=["GET"])
def environment_cities():

    records = WeatherData.query.order_by(WeatherData.created_at.desc()).all()

    data = {}

    
    for r in records:
        if r.city not in data:
            data[r.city] = {
                "city": r.city,
                "temp": r.temperature,
                "humidity": r.humidity,
                "rain": r.rainfall,
                "aqi": r.aqi
            }

    return jsonify(list(data.values()))

@app.route("/environment/summary", methods=["GET"])
def environment_summary():

    records = WeatherData.query.all()

    if not records:
        return jsonify({
            "avg_temperature": 0,
            "avg_humidity": 0,
            "avg_aqi": 0,
            "avg_rainfall": 0
        })

    avg_temp = sum(r.temperature for r in records) / len(records)
    avg_humidity = sum(r.humidity for r in records) / len(records)
    avg_aqi = sum(r.aqi for r in records) / len(records)
    avg_rain = sum(r.rainfall for r in records) / len(records)

    return jsonify({
        "avg_temperature": round(avg_temp, 2),
        "avg_humidity": round(avg_humidity, 2),
        "avg_aqi": round(avg_aqi, 2),
        "avg_rainfall": round(avg_rain, 2)
    })    
    
@app.route("/environment/live", methods=["GET"])
def environment_live():

    cities = ["Pune", "Delhi", "Mumbai", "Bangalore", "Chennai"]

    results = []

    for city in cities:
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"
        res = requests.get(url)
        current = res.json()["current"]

        pm25 = current.get("air_quality", {}).get("pm2_5", 0)

        results.append({
            "city": city,
            "temp": current["temp_c"],
            "humidity": current["humidity"],
            "rain": current["precip_mm"],
            "aqi": pm25 * 2
        })

    return jsonify(results)


@app.route("/basic-summary", methods=["GET"])
def basic_summary():

    records = Predictions.query.all()

    total = len(records)

    category_count = {}

    
    for r in records:
        cat = r.category
        category_count[cat] = category_count.get(cat, 0) + 1

    
    most_common = None
    max_count = 0

    for cat, count in category_count.items():
        if count > max_count:
            max_count = count
            most_common = cat

    
    percentages = {}

    if total > 0:
        for cat, count in category_count.items():
            percentages[cat] = round((count / total) * 100, 0)

    return jsonify({
        "totalPredictions": total,
        "mostCommon": most_common,
        "percentages": percentages
    })

@app.route("/download-report", methods=["GET"])
def download_report():

    predictions = Predictions.query.order_by(Predictions.timestamp.desc()).all()

    result = []

    for p in predictions:
        result.append({
            "date": p.timestamp.strftime("%d %b"),
            "city": p.city,
            "temperature": p.temperature,
            "humidity": p.humidity,
            "aqi": p.aqi,
            "category": p.category
        })

    return jsonify(result)

@app.route("/risk-map-data", methods=["GET"])
def risk_map_data():

    cities = {
        "Pune": {"lat": 18.5204, "lng": 73.8567},
        "Delhi": {"lat": 28.6139, "lng": 77.2090},
        "Mumbai": {"lat": 19.0760, "lng": 72.8777},
        "Bangalore": {"lat": 12.9716, "lng": 77.5946},
        "Chennai": {"lat": 13.0827, "lng": 80.2707}
    }

    results = []

    for city, coords in cities.items():

        try:
            
            url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=yes"
            res = requests.get(url)
            data = res.json()
            current = data["current"]

            pm25 = current.get("air_quality", {}).get("pm2_5", 0)
            aqi = pm25 * 2

            
            if aqi < 50:
                risk = "low"
            elif aqi < 100:
                risk = "moderate"
            elif aqi < 150:
                risk = "high"
            else:
                risk = "critical"

            results.append({
                "city": city,
                "lat": coords["lat"],
                "lng": coords["lng"],
                "temperature": current["temp_c"],
                "humidity": current["humidity"],
                "rainfall": current["precip_mm"],
                "aqi": aqi,
                "risk": risk
            })

        except Exception as e:
            print(f"Error for {city}: {e}")

    return jsonify(results)

with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)