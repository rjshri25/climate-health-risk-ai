import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

function EnvironmentalData() {
  const [env, setEnv] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [gps, setGps] = useState(null);
  const [useGPS, setUseGPS] = useState(false);

  useEffect(() => {
    fetchData();
  }, [useGPS, gps]);


  const fetchData = async () => {
    try {
      const user_id = localStorage.getItem("user_id");

      let url = `${process.env.REACT_APP_API_BASE}/environment/user-city?user_id=${user_id}`;

      if (useGPS && gps) {
        url = `${process.env.REACT_APP_API_BASE} /environment/user-city?lat=${gps.lat}&lon=${gps.lon}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to load environment data");
        return;
      }

      setEnv(data.environment);
      setPrediction(data.prediction);

      toast.success("Environment data updated");
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching data");
    }
  };

  
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });

        setUseGPS(true);

        toast.success("GPS location detected");
      },
      () => {
        toast.error("GPS permission denied");
      }
    );
  };

  if (!env) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div style={{ padding: 20 }}>Loading...</div>

          
          <ToastContainer position="top-right" />
        </div>
      </div>
    );
  }

  const radarData = [
    { metric: "Temp", value: env.temperature },
    { metric: "Humidity", value: env.humidity },
    { metric: "AQI", value: env.aqi },
    { metric: "Wind", value: env.wind_speed },
    { metric: "UV", value: env.uv_index },
  ];

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Navbar />

        <div className="content">
          
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2>🌍 Environment Dashboard</h2>
              <p style={{ color: "#666" }}>{env.city}</p>
            </div>

            <button
              onClick={getLocation}
              style={{
                padding: "8px 14px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              📍 GPS
            </button>
          </div>

          
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="mini-card">🌡 Temp: {env.temperature}°C</div>
              <div className="mini-card">💧 Humidity: {env.humidity}%</div>
              <div className="mini-card">🌫 AQI: {env.aqi}</div>
              <div className="mini-card">🌬 Wind: {env.wind_speed} km/h</div>
              <div className="mini-card">☀ UV: {env.uv_index}</div>
              <div className="mini-card">🌧 Rain: {env.rainfall} mm</div>
            </div>

            
            <div className="chart-card">
              <h3 style={{ marginBottom: "10px" }}>
                Environmental Balance
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar
                    dataKey="value"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      
      <ToastContainer position="top-right" autoClose={2000} />

      
      <style>
        {`
          .mini-card {
            background: #fff;
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            font-size: 14px;
            font-weight: 500;
          }

          .chart-card {
            background: #fff;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          }

          .content {
            padding: 20px;
          }
        `}
      </style>
    </div>
  );
}

export default EnvironmentalData;