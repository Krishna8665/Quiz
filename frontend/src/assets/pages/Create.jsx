import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../../assets/styles/AdminCreateUser.css"; 

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
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/auth/admin/register",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
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
    <div className="create-user-container">
      <h2 className="create-user-title">Create Quiz-Master</h2>

      <form className="create-user-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="create-user-input"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="create-user-input"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="create-user-input"
          required
        />

        <button type="submit" className="create-user-button">
          Create User
        </button>
      </form>
    </div>
  );
}
