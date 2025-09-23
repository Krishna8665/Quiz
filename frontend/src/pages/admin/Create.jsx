import { useState } from "react";
import axios from "axios";

export default function AdminCreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // admin token stored on login

      const res = await axios.post(
        "http://localhost:3000/api/auth/admin/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`User created: ${res.data.user?.name || "Unknown"}`);
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "black" }}>Create Quiz-Master</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        {/*  if admin to choose role */}
        {/* 
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        */}

        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
