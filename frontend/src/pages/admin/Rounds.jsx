import React, { useState } from "react";
import axios from "axios";

export default function CreateRound() {
  const [formData, setFormData] = useState({
    name: "",
    timePerQuestion: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/round/create-rounds",
        formData,
        {
          withCredentials: true, // 👈 send cookie automatically
        }
      );

      setMessage(res.data.message || "Round created successfully!");
      setFormData({ name: "", timePerQuestion: "" });
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Failed to create round. Try again."
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "60px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Create Round</h2>
      {message && (
        <p
          style={{
            color: message.includes("success") ? "green" : "red",
            textAlign: "center",
          }}
        >
          {message}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        <input
          type="text"
          name="name"
          placeholder="Round Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <input
          type="number"
          name="timePerQuestion"
          placeholder="Time per Question (in seconds)"
          value={formData.timePerQuestion}
          onChange={handleChange}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: 12,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Create
        </button>
      </form>
    </div>
  );
}
