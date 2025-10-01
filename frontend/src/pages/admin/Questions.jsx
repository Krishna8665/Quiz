import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function QuestionForm() {
  const [formData, setFormData] = useState({
    text: "",
    type: "multiple-choice",
    options: [
      { id: uuidv4(), text: "" },
      { id: uuidv4(), text: "" },
      { id: uuidv4(), text: "" },
      { id: uuidv4(), text: "" },
    ],
    correctAnswer: "",
    points: 0,
    category: "",
    round: "", 
    media: { type: "image", url: "" },
  });

  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:3000/api/quiz";

  // Handle generic input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle option text change
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  // Handle question type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type,
      options:
        type === "multiple-choice"
          ? [
              { id: uuidv4(), text: "" },
              { id: uuidv4(), text: "" },
              { id: uuidv4(), text: "" },
              { id: uuidv4(), text: "" },
            ]
          : [{ id: uuidv4(), text: "" }],
      correctAnswer: "",
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...formData,
        options: formData.options.map((opt) => opt.text),
        correctAnswer:
          formData.type === "multiple-choice"
            ? formData.correctAnswer
            : formData.options[0].text,
      };

      // Validate multiple-choice correct answer
      if (
        formData.type === "multiple-choice" &&
        !formData.options.some((opt) => opt.id === formData.correctAnswer)
      ) {
        setMessage("Please select a correct option.");
        return;
      }

      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/create-question`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Question added successfully!");
      setFormData({
        text: "",
        type: "multiple-choice",
        options: [
          { id: uuidv4(), text: "" },
          { id: uuidv4(), text: "" },
          { id: uuidv4(), text: "" },
          { id: uuidv4(), text: "" },
        ],
        correctAnswer: "",
        points: 0,
        category: "",
        round: "",
        media: { type: "image", url: "" },
      });
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(
        err.response?.data?.message || "❌ Failed to add question. Try again."
      );
    }
  };

  // Category options from model enum
  const categories = [
    "Physics",
    "Maths",
    "Chemistry",
    "Biology",
    "Zoology",
    "Botany",
  ];

  // Round options
  const rounds = [
    "General Round",
    "Subject Round",
    "Estimation Round",
    "Rapid Fire Round",
    "Buzzer Round",
  ];

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "50px auto",
        padding: 30,
        background: "#f9f9f9",
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "black" }}>
        Add Question
      </h2>
      {message && (
        <p style={{ color: message.includes("❌") ? "red" : "green" }}>
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        {/* Question text */}
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Question text"
          required
          style={{
            padding: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
            resize: "vertical",
          }}
        />

        {/* Type */}
        <select
          value={formData.type}
          onChange={handleTypeChange}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #0a0505ff",
          }}
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="short-answer">Short Answer</option>
        </select>

        {/* Options */}
        {formData.options.map((opt, idx) => (
          <input
            key={opt.id}
            type="text"
            value={opt.text}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
        ))}

        {/* Correct Answer */}
        {formData.type === "multiple-choice" && (
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                correctAnswer: e.target.value,
              }))
            }
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #0b0909ff",
            }}
          >
            <option value="">Select Correct Option</option>
            {formData.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text || "(empty option)"}
              </option>
            ))}
          </select>
        )}

        {formData.type === "short-answer" && (
          <input
            type="text"
            placeholder="Correct Answer"
            value={formData.options[0].text}
            onChange={(e) => handleOptionChange(0, e.target.value)}
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
        )}

        {/* Points */}
        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          placeholder="Points"
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        {/* Category */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Round Selection */}
        <select
          name="round"
          value={formData.round}
          onChange={handleChange}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="">Select Round</option>
          {rounds.map((rnd) => (
            <option key={rnd} value={rnd}>
              {rnd}
            </option>
          ))}
        </select>

        {/* Media URL */}
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
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        {/* Media Type */}
        <select
          name="media.type"
          value={formData.media.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              media: { ...prev.media, type: e.target.value },
            }))
          }
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        <button
          type="submit"
          style={{
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#007bff",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          Add a Question
        </button>
      </form>
    </div>
  );
}
