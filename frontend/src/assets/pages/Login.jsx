import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isRegister) {
        const res = await axios.post(
          "http://localhost:3000/api/auth/register",
          formData,
          { withCredentials: true }
        );
        setMessage(res.data.message);
      } else {
        const res = await axios.post(
          "http://localhost:3000/api/auth/login",
          {
            email: formData.email,
            password: formData.password,
          },
          { withCredentials: true } //  allows backend to set cookie
        );

        setMessage("Login successful!");
        navigate("/admin/dashboard"); //  redirect to round creation page
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong, try again"
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>{isRegister ? "Register" : "Login"}</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 12, textAlign: "center" }}>
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          style={{ color: "#007bff", cursor: "pointer" }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Login" : "Register"}
        </span>
      </p>
    </div>
  );
}
