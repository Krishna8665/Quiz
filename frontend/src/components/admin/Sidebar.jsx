import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Teams", path: "/admin/teams" },
    { name: "Questions", path: "/admin/questions" },
    { name: "Rounds", path: "/admin/rounds" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: "#1f2937",
          color: "#a12b2bff",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Admin</h2>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              padding: "12px 20px",
              textDecoration: "none",
              color: isActive ? "#1f2937" : "#fff",
              background: isActive ? "#fff" : "transparent",
              margin: "0 10px 10px 10px",
              borderRadius: 6,
              fontWeight: "bold",
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "40px 60px", // more padding
          background: "#3059adff",
          minHeight: "100vh",
          maxWidth: "calc(100% - 220px)", // ensure full width minus sidebar
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "30px",
            minHeight: "80vh", // makes the content box bigger
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
