import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import { useEffect, useState } from "react";



function ChangeView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.setView(center, zoom, {
      animate: true,
      duration: 2
    });

  }, [center, zoom, map]);

  return null;
}



function RiskMap({ selectedCity, setSelectedCity }) {

  const [cities, setCities] = useState([]); 

 

  useEffect(() => {

    const fetchData = async () => {
      try {

        const res = await fetch(`${import.meta.env.VITE_API_BASE}/risk-map-data`);
        const data = await res.json();

        if (res.ok) {
          setCities(data);
        }

      } catch (err) {
        console.error(err);
        alert("Failed to load map data");
      }
    };

    fetchData();

  }, []);

  

  const getColor = (risk) => {
    if (risk === "low") return "green";
    if (risk === "moderate") return "yellow";
    if (risk === "high") return "orange";
    return "red";
  };

 

  const selected = cities.find(c => c.city === selectedCity);

  const center = selected
    ? [selected.lat, selected.lng]
    : [22.9734, 78.6569];

  const zoom = selected ? 13 : 5;

  const visibleCities = selected ? [selected] : cities;

  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Navbar 
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
        />

        <div className="content">

          <h2>Interactive Risk Map</h2>

          <p className="subtitle">
            Click on city markers to view environmental data and health risks
          </p>

          <div style={{ height: "500px", borderRadius: "12px", overflow: "hidden" }}>

            <MapContainer
              key={selectedCity}
              center={center}
              zoom={zoom}
              style={{ height: "100%", width: "100%" }}
            >

              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <ChangeView center={center} zoom={zoom} />

              {visibleCities.map((city, index) => (
                <CircleMarker
                  key={index}
                  center={[city.lat, city.lng]}
                  radius={selected ? 14 : 10}
                  pathOptions={{
                    color: getColor(city.risk),
                    weight: selected ? 4 : 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedCity(city.city) // ✅ click to select
                  }}
                >
                  <Popup>
                    <b>{city.city}</b> <br />
                    🌡 Temp: {city.temperature}°C <br />
                    💧 Humidity: {city.humidity}% <br />
                    🌧 Rain: {city.rainfall} mm <br />
                    🌫 AQI: {city.aqi} <br />
                    ⚠ Risk: {city.risk}
                  </Popup>
                </CircleMarker>
              ))}

            </MapContainer>

          </div>

        </div>

      </div>

    </div>
  );
}

export default RiskMap;