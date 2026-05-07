import { useEffect, useState } from "react";

function ViewUsersHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/user-activity`);

      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();

      const filtered = data.filter(
        (log) => log.action === "LOGIN" || log.action === "PREDICT"
      );

      setLogs(filtered);
    } catch (err) {
      setError("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="state">Loading...</div>;
  if (error) return <div className="state error">{error}</div>;

  return (
    <div className="wrapper">
      <div className="card">
        <h2>User Activity Logs</h2>

        {logs.length === 0 ? (
          <div className="state">No activity found</div>
        ) : (
          <div className="table-box">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Action</th>
                  <th>Predict City</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{log.username}</td>
                    <td className="email">{log.email}</td>
                    <td>{log.user_city}</td>

                    <td>
                      <span
                        className={`badge ${
                          log.action === "LOGIN" ? "login" : "predict"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td>{log.city || "-"}</td>
                    <td className="details">{log.details || "-"}</td>
                    <td className="time">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      <style>{`
        .wrapper {
          min-height: 100vh;
          background: #f4f6fb;
          padding: 20px;
          display: flex;
          justify-content: center;
        }

        .card {
          width: 100%;
          max-width: 1200px;
          background: white;
          padding: 18px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          color: #111827; /* FIX TEXT */
        }

        h2 {
          margin-bottom: 12px;
          font-size: 20px;
          color: #111827;
        }

        .table-box {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 700px; 
          border-collapse: collapse;
          color: #111827;
        }

        thead {
          background: #1f2937;
          color: white;
        }

        th {
          padding: 10px 8px;
          font-size: 13px;
          text-align: left;
          white-space: nowrap;
        }

        td {
          padding: 8px 8px;
          font-size: 13px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        /* badges */
        .badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }

        .login {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .predict {
          background: #dcfce7;
          color: #15803d;
        }

        /* compact columns */
        .email {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .details {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .time {
          white-space: nowrap;
          font-size: 12px;
          color: #374151;
        }

        .state {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .state.error {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}

export default ViewUsersHistory;