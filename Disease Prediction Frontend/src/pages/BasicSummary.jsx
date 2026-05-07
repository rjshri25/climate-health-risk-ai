import React, { useEffect, useState } from "react";
import axios from "axios";

function BasicSummary() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/basic-summary`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching summary:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  if (!data) {
    return <h3 style={{ color: "#fff", textAlign: "center" }}>No data found</h3>;
  }

  return (
    <div style={styles.page}>

      <h2 style={styles.title}>Summary Dashboard</h2>

      
      <div style={styles.cardRow}>

        <div style={styles.card}>
          <p style={styles.label}>Total Predictions</p>
          <h1 style={styles.value}>{data.totalPredictions}</h1>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Most Common Category</p>
          <h2 style={styles.highlight}>{data.mostCommon}</h2>
        </div>

      </div>

      
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>Category Distribution</h3>

        {Object.entries(data.percentages || {}).map(([cat, value]) => (
          <div key={cat} style={styles.row}>

            <span style={styles.cat}>{cat}</span>

            <div style={styles.barBg}>
              <div style={{ ...styles.barFill, width: `${value}%` }} />
            </div>

            <span style={styles.percent}>{value}%</span>

          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {

  page: {
    padding: "25px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    color: "#fff",
    fontFamily: "Segoe UI, sans-serif"
  },

  title: {
    fontSize: "22px",
    marginBottom: "20px",
    fontWeight: "600"
  },

  sectionTitle: {
    marginBottom: "15px",
    fontSize: "16px",
    color: "#cbd5e1"
  },

  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "20px"
  },

  card: {
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    transition: "0.3s ease",
  },

  label: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "6px"
  },

  value: {
    fontSize: "34px",
    color: "#22c55e",
    margin: 0
  },

  highlight: {
    fontSize: "20px",
    color: "#60a5fa",
    margin: 0
  },

  box: {
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)"
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px"
  },

  cat: {
    width: "160px",
    color: "#cbd5e1",
    fontSize: "14px"
  },

  percent: {
    width: "50px",
    textAlign: "right",
    color: "#22c55e",
    fontWeight: "600"
  },

  barBg: {
    flex: 1,
    height: "10px",
    background: "#1e293b",
    borderRadius: "20px",
    overflow: "hidden"
  },

  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #3b82f6)",
    borderRadius: "20px",
    transition: "width 0.6s ease"
  },

  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a"
  },

  loader: {
    width: "45px",
    height: "45px",
    border: "4px solid #1e293b",
    borderTop: "4px solid #22c55e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }
};
export default BasicSummary;