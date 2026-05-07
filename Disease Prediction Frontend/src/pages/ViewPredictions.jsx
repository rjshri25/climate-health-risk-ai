import { useState, useEffect } from "react";
import axios from "axios";

function ViewPredictions() {

  const [predictions, setPredictions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/predictions-table`)
      .then((res) => {
        setPredictions(res.data);
        setFilteredData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredData(predictions);
    } else {
      setFilteredData(
        predictions.filter(p => p.category === selectedCategory)
      );
    }
  }, [selectedCategory, predictions]);

  const categories = ["All", ...new Set(predictions.map(p => p.category))];

  const getRiskColor = (risk) => {
    if (risk === "High") return "#ef4444";
    if (risk === "Medium") return "#f59e0b";
    if (risk === "Low") return "#22c55e";
    return "#64748b";
  };

  if (loading) {
    return <h3 style={{ color: "#fff" }}>Loading...</h3>;
  }

  return (
    <div style={styles.page}>

      <h2 style={styles.title}>📊 Prediction Records</h2>

      
      <div style={styles.filterBox}>
        <select
          style={styles.select}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, i) => (
            <option key={i}>{cat}</option>
          ))}
        </select>
      </div>

     
      <div style={styles.tableWrapper}>
        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>🌡 Temp</th>
              <th style={styles.th}>💧 Humidity</th>
              <th style={styles.th}>🌫 AQI</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Risk</th>
              <th style={styles.th}>Probability</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((p, i) => (
              <tr
                key={i}
                style={styles.row}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(148,163,184,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >

                <td style={styles.td}>{p.date}</td>

                {/* FIX: prevent layout break */}
                <td style={{ ...styles.td, maxWidth: "180px" }}>
                  {p.city}
                </td>

                <td style={styles.td}>
                  {p.temperature !== null ? `${p.temperature}°C` : "-"}
                </td>

                <td style={styles.td}>
                  {p.humidity !== null ? `${p.humidity}%` : "-"}
                </td>

                <td style={styles.td}>
                  {p.aqi !== null ? p.aqi : "-"}
                </td>

                <td style={styles.td}>
                  <span style={styles.badge}>{p.category}</span>
                </td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.riskBadge,
                      background: getRiskColor(p.risk_level)
                    }}
                  >
                    {p.risk_level}
                  </span>
                </td>

                <td style={styles.td}>
                  {p.probability ? `${p.probability}%` : "-"}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

const styles = {

  page: {
    padding: "20px",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "sans-serif"
  },

  title: {
    marginBottom: "20px",
    fontSize: "22px"
  },

  filterBox: {
    marginBottom: "15px"
  },

  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#1e293b",
    color: "#fff",
    border: "1px solid #334155"
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.2)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed" // 🔥 KEY FIX
  },

  th: {
    padding: "12px",
    textAlign: "left",
    background: "#020617",
    color: "#94a3b8",
    fontSize: "13px",
    borderBottom: "1px solid #334155"
  },

  td: {
    padding: "12px",
    fontSize: "14px",
    borderBottom: "1px solid rgba(148,163,184,0.1)",
    wordWrap: "break-word"
  },

  row: {
    transition: "0.2s"
  },

  badge: {
    background: "#334155",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px"
  },

  riskBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold"
  }
};

export default ViewPredictions;