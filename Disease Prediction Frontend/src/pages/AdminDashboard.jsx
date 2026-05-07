import { useState, useEffect } from "react";

import AdminSidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

import ViewPredictions from "./ViewPredictions";
import BasicSummary from "./BasicSummary";
import DownloadReport from "./DownloadReport";
import ViewHistory from "./ViewHistory";

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

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  const [aqiData, setAqiData] = useState([]);

  const [riskData, setRiskData] = useState([
    { name: "Low", value: 0 },
    { name: "Moderate", value: 0 },
    { name: "High", value: 0 },
    { name: "Critical", value: 0 }
  ]);

  const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

  const getAQIColor = (aqi) => {
    if (aqi <= 100) return "#22c55e";
    if (aqi <= 200) return "#eab308";
    if (aqi <= 300) return "#f97316";
    return "#ef4444";
  };

  

  useEffect(() => {
    fetchAQIData();
  }, []);

  const fetchAQIData = async () => {
    try {
     const res = await fetch(`${import.meta.env.VITE_API_BASE}/environment/cities`)

      const data = await res.json();

      setAqiData(data);

      

      let low = 0,
        moderate = 0,
        high = 0,
        critical = 0;

      data.forEach((c) => {
        if (c.aqi <= 100) low++;
        else if (c.aqi <= 200) moderate++;
        else if (c.aqi <= 300) high++;
        else critical++;
      });

      setRiskData([
        { name: "Low", value: low },
        { name: "Moderate", value: moderate },
        { name: "High", value: high },
        { name: "Critical", value: critical }
      ]);

    } catch (err) {
      console.error("Failed to load AQI data", err);
    }
  };

  
  const renderContent = () => {
    if (activePage === "dashboard") {
      return (
        <>
          <h2>Admin Health Dashboard</h2>

          <p className="subtitle">
            Live overview of environmental conditions in India
          </p>

          
          <div className="summary-cards">

            <div className="summary-card">
              <div className="card-header">
                <h5>CITIES MONITORED</h5>
                <ShieldAlert size={18} />
              </div>
              <h2>{aqiData.length}</h2>
              <p>Active cities</p>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h5>AVG AQI</h5>
                <Wind size={18} />
              </div>
              <h2>
                {aqiData.length
                  ? Math.round(
                      aqiData.reduce((a, b) => a + b.aqi, 0) /
                        aqiData.length
                    )
                  : 0}
              </h2>
              <p>Live average</p>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h5>AVG TEMP</h5>
                <Thermometer size={18} />
              </div>
              <h2>
                {aqiData.length
                  ? Math.round(
                      aqiData.reduce((a, b) => a + b.temp, 0) /
                        aqiData.length
                    )
                  : 0}
                °C
              </h2>
              <p>Across India</p>
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
                      <Cell
                        key={index}
                        fill={getAQIColor(entry.aqi)}
                      />
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
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </>
      );
    }

    if (activePage === "view") return <ViewPredictions />;
    if (activePage === "summary") return <BasicSummary />;
    if (activePage === "download") return <DownloadReport />;
    if (activePage === "users") return <ViewHistory />;
  };

  return (
    <div className="layout">
      <AdminSidebar setActivePage={setActivePage} />

      <div className="main">
        <Navbar />

        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;