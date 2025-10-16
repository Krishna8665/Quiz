import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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

      toast.success(`User created: ${res.data.user?.name || "Unknown"}`);
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "50px auto",
        padding: "180px",
        backgroundColor: "#f9f9f9ff",
        borderRadius: "22px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          color: "black",
          textAlign: "center",
          marginBottom: "20px",
          fontWeight: 700,
          fontSize: "28x",
        }}
      >
        Create Quiz-Master
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #fcfbfbff",
          }}
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #fbf9f9ff",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "14px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Create User
        </button>
      </form>
    </div>
  );
}
