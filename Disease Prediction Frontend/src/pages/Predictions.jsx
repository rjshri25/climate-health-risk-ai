import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Predictions() {
  const [city, setCity] = useState("");
  const [gps, setGps] = useState(null);
  const [useGPS, setUseGPS] = useState(false);

  const [allPredictions, setAllPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const user_id = localStorage.getItem("user_id");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/history?user_id=${user_id}`
      );

      const data = await res.json();

      if (res.ok) setAllPredictions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/history/delete/${id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setAllPredictions((prev) =>
          prev.filter((item) => item.id !== id)
        );
        toast.success("Deleted successfully");
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setGps({ lat, lon });
        setUseGPS(true);

        await handlePredict(lat, lon);
      },
      () => {
        alert("GPS permission denied");
        setLoading(false);
      }
    );
  };

  const handlePredict = async (lat = null, lon = null) => {
    if (!city && !lat) {
      setErrorMsg("Please enter valid city");
      return;
    }

    setErrorMsg("");

    try {
      setLoading(true);

      const user_id = localStorage.getItem("user_id");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/weather`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, user_id, lat, lon }),
        }
      );

      const data = await res.json();

      console.log("Prediction Response:", data);

      if (!res.ok) {
        setErrorMsg("Prediction failed");
        return;
      }

      toast.success("Prediction successful ✔️");
      await fetchHistory();
    } catch (error) {
      console.error(error);
      setErrorMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = allPredictions.filter((item) =>
    city === "" ||
    (item.city || "").toLowerCase().includes(city.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar />

        <div className="dashboard-header">
          <h2>AI Predictions</h2>
          <p>Machine learning predictions</p>
        </div>

        <div className="content">
          {/* INPUT */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="City, State, Country"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ padding: "8px", width: "250px" }}
            />

            <button
              onClick={() => handlePredict()}
              style={{ marginLeft: "10px", padding: "8px" }}
            >
              {loading ? "Predicting..." : "Get Prediction"}
            </button>

            <button
              onClick={getLocation}
              style={{
                marginLeft: "10px",
                padding: "8px",
                background: "#3b82f6",
                color: "white",
                border: "none",
              }}
            >
              📍 Use My Location
            </button>
          </div>

          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

          {/* RESULTS */}
          <div className="charts">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => {
                const isSafe =
                  item.category?.toLowerCase().includes("normal") ||
                  item.risk_level === "Safe";

                return (
                  <div
                    key={index}
                    className="chart-box"
                    style={{
                      borderLeft: isSafe
                        ? "6px solid green"
                        : "6px solid orange",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <h3>
                      {isSafe
                        ? "🌿 Normal / Safe Conditions"
                        : item.disease || item.category}
                    </h3>

                    <p>📍 {item.city}</p>

                    <p>
                      {isSafe
                        ? "Safe environmental conditions"
                        : item.cause || "Risk detected"}
                    </p>

                    <p>
                      Risk: {item.risk_level || "Safe"}
                    </p>

                    {!isSafe && item.disease_prob != null && (
                      <p>
                        {item.disease_prob}% probability
                      </p>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        marginTop: "10px",
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })
            ) : (
              <p>No predictions yet</p>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default Predictions;