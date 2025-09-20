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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          background: "#1f2937",
          color: "#fff",
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
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20, background: "#f3f4f6" }}>
        <Outlet />
      </div>
    </div>
  );
}
