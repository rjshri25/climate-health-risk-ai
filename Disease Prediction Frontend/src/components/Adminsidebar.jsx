import {
  LayoutDashboard,
  Activity,
  FileText,
  Download,
  Users
} from "lucide-react";

import { useState } from "react";

function AdminSidebar({ activePage, setActivePage }) {

  const styles = {
    sidebar: {
      width: "260px",
      height: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
    },

    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "30px",
    },

    logoIcon: {
      width: "42px",
      height: "42px",
      background: "#22c55e",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      color: "#000",
      fontSize: "14px",
    },

    logoText: {
      display: "flex",
      flexDirection: "column",
    },

    title: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "600",
    },

    subtitle: {
      margin: 0,
      fontSize: "11px",
      color: "#94a3b8",
    },

    menu: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    item: (active, hovered) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 12px",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",

      
      borderLeft: active ? "4px solid #22c55e" : "4px solid transparent",

      background: active
        ? "rgba(34, 197, 94, 0.20)"
        : hovered
        ? "rgba(59, 130, 246, 0.10)"
        : "transparent",

      color: active ? "#22c55e" : "#cbd5e1",

      transform: active
        ? "translateX(6px)"
        : hovered
        ? "translateX(4px)"
        : "translateX(0)",

      
      boxShadow: active ? "0 0 12px rgba(34, 197, 94, 0.25)" : "none",

      fontWeight: active ? "600" : "400",
    }),
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "view", label: "View Predictions", icon: <Activity size={18} /> },
    { id: "summary", label: "Basic Summary", icon: <FileText size={18} /> },
    { id: "download", label: "Download Report", icon: <Download size={18} /> },
    { id: "users", label: "Users History", icon: <Users size={18} /> },
  ];

  return (
    <div style={styles.sidebar}>

      
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>AI</div>

        <div style={styles.logoText}>
          <h3 style={styles.title}>AI Health Monitor</h3>
          <p style={styles.subtitle}>ADMIN PANEL</p>
        </div>
      </div>

      <div style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;

          return (
            <MenuItem
              key={item.id}
              item={item}
              isActive={isActive}
              setActivePage={setActivePage}
              styles={styles}
            />
          );
        })}
      </div>

    </div>
  );
}


function MenuItem({ item, isActive, setActivePage, styles }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={styles.item(isActive, hovered)}
      onClick={() => setActivePage(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.icon}
      <span>{item.label}</span>
    </div>
  );
}

export default AdminSidebar;