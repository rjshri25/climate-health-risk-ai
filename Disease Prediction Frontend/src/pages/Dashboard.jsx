import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Wind,
  Thermometer
} from "lucide-react";

function Dashboard() {

  const [aqiData, setAqiData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [summary, setSummary] = useState({
    critical: 0,
    high: 0,
    low: 0,
    avgAqi: 0,
    avgTemp: 0
  });
  const userId = localStorage.getItem("user_id");

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {

    const fetchData = async () => {
      try {

        
        const res1 = await fetch("http://localhost:5000/live-weather");
        const data1 = await res1.json();

        
        const res2 = await fetch("http://localhost:5000/environment/live");
        const data2 = await res2.json();

        if (res1.ok && res2.ok) {

         
          setAqiData(
            data1.map(item => ({
              city: item.city,
              aqi: item.aqi
            }))
          );

          
          let counts = {
            Low: 0,
            Moderate: 0,
            High: 0,
            Critical: 0
          };

          data1.forEach(item => {
            const level = item.risk_level;
            if (counts[level] !== undefined) {
              counts[level]++;
            }
          });

          setRiskData([
            { name: "Low", value: counts.Low },
            { name: "Moderate", value: counts.Moderate },
            { name: "High", value: counts.High },
            { name: "Critical", value: counts.Critical }
          ]);

          
          const total = data1.length || 1;

          const avgAqi =
            data1.reduce((sum, item) => sum + item.aqi, 0) / total;

          const avgTemp =
            data2.reduce((sum, item) => sum + item.temp, 0) / total;

          setSummary({
            critical: counts.Critical,
            high: counts.High,
            low: counts.Low,
            avgAqi: avgAqi.toFixed(1),
            avgTemp: avgTemp.toFixed(1)
          });
        }

      } catch (err) {
        console.error(err);
        alert("Failed to load dashboard data");
      }
    };

    fetchData();

  }, []);

  

  const getAQIColor = (aqi) => {
    if (aqi <= 100) return "#22c55e";
    if (aqi <= 200) return "#eab308";
    if (aqi <= 300) return "#f97316";
    return "#ef4444";
  };

  const COLORS = [
    "#22c55e",
    "#eab308",
    "#f97316",
    "#ef4444"
  ];

  return (

    <div className="layout">

      <Sidebar />

      <div className="main">

        <Navbar />

        <div className="content">

          <h2>Health Risk Dashboard</h2>

          <p className="subtitle">
            Overview of all monitored cities in India
          </p>

          

          <div className="summary-cards">

            <div className="summary-card">
              <div className="card-header">
                <h5>CRITICAL RISKS</h5>
                <div className="icon red-icon">
                  <ShieldAlert size={18} />
                </div>
              </div>
              <h2>{summary.critical}</h2>
              <p className="red-text">Active predictions</p>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h5>HIGH RISKS</h5>
                <div className="icon orange-icon">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <h2>{summary.high}</h2>
              <p className="orange-text">Areas affected</p>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h5>LOW RISKS</h5>
                <div className="icon green-icon">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <h2>{summary.low}</h2>
              <p className="green-text">Safe zones</p>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h5>AVG. AQI</h5>
                <div className="icon purple-icon">
                  <Wind size={18} />
                </div>
              </div>
              <h2>{summary.avgAqi}</h2>
              <p>Across cities</p>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h5>AVG. TEMP</h5>
                <div className="icon blue-icon">
                  <Thermometer size={18} />
                </div>
              </div>
              <h2>{summary.avgTemp}°C</h2>
              <p>Across cities</p>
            </div>

          </div>

          

          <div className="charts">

            
            <div className="chart-box">

              <h3>Air Quality Index by City</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aqiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />

                  <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
                    {aqiData.map((entry, index) => (
                      <Cell key={index} fill={getAQIColor(entry.aqi)} />
                    ))}
                  </Bar>

                </BarChart>
              </ResponsiveContainer>

            </div>

            
            <div className="chart-box">

              <h3>Risk Distribution</h3>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>

                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>

                  <Legend />
                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;