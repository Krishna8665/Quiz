import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";

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
    points: "",
    category: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const API_URL = "http://localhost:3000/api";

  // 🟢 Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Handle question type change
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

  // 🟢 Handle option input changes
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  // 🟢 File upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileRemove = () => {
    setFile(null);
    setPreview(null);
  };

  // 🟢 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("text", formData.text);
      payload.append("category", formData.category);
      payload.append("points", formData.points);

      // Backend expects options as array of objects → { text: string }
      payload.append(
        "options",
        JSON.stringify(formData.options.map((opt) => ({ text: opt.text })))
      );

      // If multiple choice, correct answer must be one of the texts
      const correctAnswerValue =
        formData.type === "multiple-choice"
          ? formData.options.find((o) => o.id === formData.correctAnswer)?.text ||
            ""
          : formData.options[0].text;

      payload.append("correctAnswer", correctAnswerValue);

      if (file) payload.append("media", file);

      await axios.post(`${API_URL}/question/create-question`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Question added successfully!");

      // Reset form
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
        points: "",
        category: "",
      });
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Error creating question:", err);
      toast.error(
        err.response?.data?.message || "❌ Failed to add question. Try again."
      );
    }
  };

  const categories = [
    "Physics",
    "Maths",
    "Chemistry",
    "Biology",
    "Zoology",
    "Botany",
  ];

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "50px auto",
        padding: 30,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Toaster position="top-center" />
      <h2 style={{ textAlign: "center", color: "black" }}>Add Question</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        {/* Question text */}
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Enter your question..."
          required
          style={{
            padding: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        {/* Question type */}
        <select
          value={formData.type}
          onChange={handleTypeChange}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
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

        {/* Correct answer selection */}
        {formData.type === "multiple-choice" ? (
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, correctAnswer: e.target.value }))
            }
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select Correct Option</option>
            {formData.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text || "(empty option)"}
              </option>
            ))}
          </select>
        ) : (
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
          min="1"
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
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
          }}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* File upload */}
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        {preview && (
          <div style={{ position: "relative", display: "inline-block" }}>
            {file?.type.startsWith("image") ? (
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: 200, borderRadius: 6 }}
              />
            ) : (
              <video
                src={preview}
                controls
                style={{ maxWidth: 200, borderRadius: 6 }}
              />
            )}
            <button
              type="button"
              onClick={handleFileRemove}
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: 25,
                height: 25,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Submit */}
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
          }}
        >
          Add Question
        </button>
      </form>
    </div>
  );
}
