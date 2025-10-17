import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    //{ name: "Manage Questions", path: "/admin/manage-questions" },
    { name: "Teams", path: "/admin/teams" },
    { name: "Questions", path: "/admin/questions" },
    { name: "Rounds", path: "/admin/rounds" },
    { name: "Create Quiz", path: "/admin/create" },
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
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Admin Panel</h2>

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              padding: "12px 20px",
              textDecoration: "none",
              color: isActive ? "#1f2937" : "#f3eeeeff",
              background: isActive ? "#fff" : "transparent",
              margin: "0 10px 10px 10px",
              borderRadius: 6,
              fontWeight: "bold",
              display: "block",
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
          padding: "40px 60px",
          background: "#f9fafb",
          minHeight: "100vh",
          marginLeft: 220,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "30px",
            minHeight: "80vh",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
