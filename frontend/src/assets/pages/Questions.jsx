import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import "../styles/question.css"

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
    category: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const API_URL = "http://localhost:3000/api";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("text", formData.text);
      payload.append("category", formData.category);

      payload.append(
        "options",
        JSON.stringify(formData.options.map((opt) => ({ text: opt.text })))
      );

      const correctAnswerValue =
        formData.type === "multiple-choice"
          ? formData.options.find((o) => o.id === formData.correctAnswer)
              ?.text || ""
          : formData.options[0].text;

      payload.append("correctAnswer", correctAnswerValue);
      if (file) payload.append("media", file);

      await axios.post(`${API_URL}/question/create-question`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Question added successfully!");

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
    <div className="question-form-container">
      <Toaster position="top-center" />
      <h2 className="form-title">ADD QUESTION</h2>

      <form onSubmit={handleSubmit} className="question-form">
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Enter your question..."
          required
          className="form-textarea"
        />

        <select
          value={formData.type}
          onChange={handleTypeChange}
          className="form-select"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="short-answer">Short Answer</option>
        </select>

        {formData.options.map((opt, idx) => (
          <input
            key={opt.id}
            type="text"
            value={opt.text}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            required
            className="form-input"
          />
        ))}

        {formData.type === "multiple-choice" ? (
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                correctAnswer: e.target.value,
              }))
            }
            required
            className="form-select"
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
            className="form-input"
          />
        )}

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="form-file"
        />

        {preview && (
          <div className="preview-container">
            {file?.type.startsWith("image") ? (
              <img src={preview} alt="Preview" className="preview-media" />
            ) : (
              <video src={preview} controls className="preview-media" />
            )}
            <button
              type="button"
              onClick={handleFileRemove}
              className="remove-btn"
            >
              ×
            </button>
          </div>
        )}

        <button type="submit" className="submit-btn">
          Add Question
        </button>
      </form>
    </div>
  );
}
