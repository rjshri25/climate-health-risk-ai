import { useState } from "react";

function DownloadReport() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/predictions-table"
      );

      if (!res.ok) throw new Error("Failed to fetch report");

      const data = await res.json();

      if (!data || data.length === 0) {
        alert("No report data found");
        setLoading(false);
        return;
      }

      
      const headers =
        "Date,City,Temperature,Humidity,AQI,Category,Disease,Risk Level,Probability\n";

     
      const rows = data
        .map((p) =>
          [
            p.date,
            p.city,
            p.temperature,
            p.humidity,
            p.aqi,
            p.category,
            p.disease,
            p.risk_level,
            p.probability,
          ].join(",")
        )
        .join("\n");

      const blob = new Blob([headers + rows], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "prediction_report.csv";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error downloading report");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="report-wrapper">
      <div className="report-card">
        <h2>Prediction Report</h2>

        <p className="subtext">
          Download full disease prediction report with weather data.
        </p>

        <button
          onClick={downloadCSV}
          className="download-btn"
          disabled={loading}
        >
          {loading ? "Generating..." : "📥 Download CSV Report"}
        </button>
      </div>

      
      <style>{`
        .report-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start; /* ✅ FIX: top aligned */
          background: #f4f6fb;
          padding: 30px 20px;
        }

        .report-card {
          margin-top: 20px;
          background: white;
          padding: 25px;
          border-radius: 12px;
          width: 100%;
          max-width: 520px;
          text-align: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }

        h2 {
          margin-bottom: 10px;
          font-size: 20px;
          color: #111827;
        }

        .subtext {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .download-btn {
          background: #1f2937;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }

        .download-btn:hover {
          background: #111827;
          transform: translateY(-2px);
        }

        .download-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default DownloadReport;