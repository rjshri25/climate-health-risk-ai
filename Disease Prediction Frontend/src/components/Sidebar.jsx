import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  CloudSun,
  Activity,
  Bell,
  FileText,
  Users
} from "lucide-react";

function Sidebar() {

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">

     
      <div className="logo-section">
        <div className="logo-icon">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 6v6c0 5 3.4 9.7 9 11 5.6-1.3 9-6 9-11V6l-9-4z"
      stroke="white" stroke-width="2" fill="none"/>
    <path d="M9 12l2 2 4-5"
      stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>
        <div>
          <h3>AI Health Monitor</h3>
          <p>INDIA</p>
        </div>
      </div>

      
      <div className="menu">

        <Link 
          to="/dashboard" 
          className={`menu-item ${isActive("/dashboard") ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link 
          to="/risk-map" 
          className={`menu-item ${isActive("/risk-map") ? "active" : ""}`}
        >
          <Map size={18} />
          Risk Map
        </Link>

        <Link 
          to="/environmental-data" 
          className={`menu-item ${isActive("/environmental-data") ? "active" : ""}`}
        >
          <CloudSun size={18} />
          Environmental Data
        </Link>

        <Link 
          to="/predictions" 
          className={`menu-item ${isActive("/predictions") ? "active" : ""}`}
        >
          <Activity size={18} />
          Predictions
        </Link>

        
        <Link 
          to="/alerts" 
          className={`menu-item ${isActive("/alerts") ? "active" : ""}`}
        >
          <Bell size={18} />
          Alerts
        </Link>

        <Link 
          to="/reports" 
          className={`menu-item ${isActive("/reports") ? "active" : ""}`}
        >
          <FileText size={18} />
          Reports
        </Link>

        

      </div>

    </div>
  );
}

export default Sidebar;