import React, { useState } from "react";
import axios from "axios";

export default function QuestionForm() {
  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 0,
    category: "",
    media: { type: "image", url: "" },
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/quiz/create-question",
        formData
      );
      setMessage("Question added successfully!");
      // Reset form
      setFormData({
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 0,
        category: "",
        media: { type: "image", url: "" },
      });
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Failed to add question. Try again."
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Add Question</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="text"
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Question text"
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        {formData.options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            required
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        ))}
        <input
          type="text"
          name="correctAnswer"
          value={formData.correctAnswer}
          onChange={handleChange}
          placeholder="Correct answer"
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          placeholder="Points"
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          type="text"
          name="media.url"
          value={formData.media.url}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              media: { ...prev.media, url: e.target.value },
            }))
          }
          placeholder="Media URL (optional)"
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <select
          name="media.type"
          value={formData.media.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              media: { ...prev.media, type: e.target.value },
            }))
          }
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

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
          Add Question
        </button>
      </form>
    </div>
  );
}
