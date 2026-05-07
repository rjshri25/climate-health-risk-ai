import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Reports({ selectedCity, setSelectedCity }) {

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {

    const userId = localStorage.getItem("user_id");

      fetch(`${import.meta.env.VITE_API_BASE}/user/download-report?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setReportData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, []);

 
  const handleDownload = () => {

    const csv = [
      ["Date","City","Temp","Humidity","AQI","Category","Disease","Risk"],
      ...reportData.map(r => [
        r.date,
        r.city,
        r.temperature ?? "-",
        r.humidity ?? "-",
        r.aqi ?? "-",
        r.category,
        r.disease ?? "-",
        r.risk_level ?? "-"
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "user_report.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  
  const handleSort = () => {
    const sorted = [...reportData].sort((a, b) => (b.aqi || 0) - (a.aqi || 0));
    setReportData(sorted);
  };

  
  const filteredData =
    selectedCity === "India"
      ? reportData
      : reportData.filter(r => r.city?.includes(selectedCity));

  return (
    <>
      <style>{`
        .table-container {
          margin-top: 20px;
          overflow-x: auto;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .modern-table thead {
          background: #2c3e50;
          color: #fff;
        }

        .modern-table th {
          padding: 14px;
          text-align: left;
        }

        .modern-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        .modern-table tr:hover {
          background: #f4f6f9;
        }

        .temp-badge {
          background: #e3f2fd;
          padding: 5px 10px;
          border-radius: 6px;
        }

        .aqi-badge {
          padding: 5px 10px;
          border-radius: 6px;
          color: white;
          font-weight: bold;
        }

        .aqi-good { background: #2ecc71; }
        .aqi-moderate { background: #f39c12; }
        .aqi-bad { background: #e74c3c; }

        .cat-badge {
          padding: 5px 10px;
          border-radius: 6px;
          color: white;
          font-size: 12px;
        }

        .cat-Vector-borne { background: #9b59b6; }
        .cat-Heat { background: #e67e22; }
        .cat-Respiratory { background: #3498db; }

        .btn-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
      `}</style>

      <div className="layout">

        <Sidebar />

        <div className="main">

          <Navbar
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
          />

          <div className="dashboard-header">
            <h2>My Reports</h2>
            <p>User-specific prediction history</p>
          </div>

          <div className="content">

            
            <div className="btn-group">
              <button className="chart-box" onClick={handleDownload}>
                📥 Download My Report
              </button>

              <button className="chart-box" onClick={handleSort}>
                🔽 Sort by AQI
              </button>
            </div>

            
            {loading ? (
              <div className="chart-box">
                <p>Loading your reports...</p>
              </div>
            ) : filteredData.length > 0 ? (

              <div className="table-container">

                <table className="modern-table">

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>City</th>
                      <th>Temperature</th>
                      <th>Humidity</th>
                      <th>AQI</th>
                      <th>Category</th>
                      <th>Disease</th>
                      <th>Risk</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredData.map((r, index) => (

                      <tr key={index}>

                        <td>{r.date}</td>
                        <td>{r.city}</td>

                        <td>
                          <span className="temp-badge">
                            {r.temperature ?? "-"}°C
                          </span>
                        </td>

                        <td>{r.humidity ?? "-"}</td>

                        <td>
                          <span className={`aqi-badge ${
                            r.aqi < 50
                              ? "aqi-good"
                              : r.aqi < 100
                              ? "aqi-moderate"
                              : "aqi-bad"
                          }`}>
                            {r.aqi ?? "-"}
                          </span>
                        </td>

                        <td>
                          <span className={`cat-badge cat-${r.category}`}>
                            {r.category}
                          </span>
                        </td>

                        <td>{r.disease ?? "-"}</td>

                        <td>{r.risk_level ?? "-"}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="chart-box">
                <p>No reports found for this user</p>
              </div>

            )}

          </div>

        </div>
      </div>
    </>
  );
}

export default Reports;