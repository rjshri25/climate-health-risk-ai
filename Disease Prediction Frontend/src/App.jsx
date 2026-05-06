import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

/* PAGE IMPORTS */

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

import EnvironmentalData from "./pages/EnvironmentalData";
import Reports from "./pages/Reports";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import RiskMap from "./pages/RiskMap";

function App() {

  const [selectedCity, setSelectedCity] =
    useState("India");

  return (
    

    <BrowserRouter>

      <Routes>
        

        {/* LOGIN ROUTES */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* SIGNUP */}

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* PUBLIC DASHBOARD */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/adminDashboard"
          element={<AdminDashboard />}
        />

        {/* ENVIRONMENTAL DATA */}

        <Route
          path="/environmental-data"
          element={
            <EnvironmentalData
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
            />
          }
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <Reports
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
            />
          }
        />

        {/* RISK MAP */}

        <Route
          path="/risk-map"
          element={
            <RiskMap
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
            />
          }
        />

        {/* ALERTS */}

        <Route
          path="/alerts"
          element={
            <Alerts
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
            />
          }
        />

        {/* PREDICTIONS */}

        <Route
          path="/predictions"
          element={
            <Predictions
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;