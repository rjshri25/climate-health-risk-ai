import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Alerts({ selectedCity, setSelectedCity }) {

  const [alertsData, setAlertsData] = useState([]);

  
  useEffect(() => {
    fetch("http://127.0.0.1:5000/live-weather")
      .then(res => res.json())
      .then(data => setAlertsData(data));
  }, []);

  
  const filteredAlerts =
    selectedCity === "India"
      ? alertsData
      : alertsData.filter(a => a.city === selectedCity);

  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Navbar 
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
        />

        <div className="dashboard-header">
          <h2>Health Alerts</h2>
          <p>Real-time monitoring</p>
        </div>

        <div className="content">

          {filteredAlerts.length === 0 ? (
            <div className="chart-box">
              <p>No active alerts</p>
            </div>
          ) : (
            <div className="charts">

              {filteredAlerts.map((alert, index) => (

                <div 
                  key={index} 
                  className="chart-box"
                  style={{
                    borderLeft: 
                      alert.risk_level === "Critical"
                        ? "5px solid red"
                        : alert.risk_level === "High"
                        ? "5px solid orange"
                        : "5px solid green"
                  }}
                >

                  <h3>{alert.city}</h3>

                  <p>
                    🌡 {alert.temperature}°C | 💧 {alert.humidity}%
                  </p>

                  <p>🌫 AQI: {alert.aqi}</p>

                  <p>
                    Disease: {alert.disease || "No risk"}
                  </p>

                  <p>
                    Risk: {alert.risk_level}
                  </p>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}