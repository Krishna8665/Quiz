import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

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
  });

  const [rounds, setRounds] = useState([]); // dynamic rounds
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:3000/api";

  // Fetch rounds on mount
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get(`${API_URL}/round/get-rounds`, {
          withCredentials: true, // ✅ send cookies automatically
        });
        setRounds(res.data.rounds || []);
      } catch (err) {
        console.error(
          "Error fetching rounds:",
          err.response?.data || err.message
        );
        toast.error("Failed to load rounds");
      }
    };
    fetchRounds();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("text", formData.text);
      payload.append(
        "options",
        JSON.stringify(formData.options.map((opt) => opt.text))
      );

      const correctAnswerValue =
        formData.type === "multiple-choice"
          ? formData.correctAnswer // ID of selected option
          : formData.options[0].text; // text for short-answer

      payload.append("correctAnswer", correctAnswerValue);
      payload.append("points", formData.points.toString());
      payload.append("category", formData.category);
      payload.append("round", formData.round);

      if (file) payload.append("media", file);

      const res = await axios.post(`${API_URL}/quiz/create-question`, payload, {
        withCredentials: true, // ✅ send cookie automatically
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Question added successfully!");
      setMessage("✅ Question added successfully!");

      // reset form
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
      });
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Unable to upload.");
      setMessage(
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
        background: "#f9f9f9",
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "black" }}>
        Add a Question
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
        {/* Question Text */}
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

        {/* Question Type */}
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

        {/* Round */}
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
            <option key={rnd._id} value={rnd._id}>
              {rnd.name}
            </option>
          ))}
        </select>

        {/* File */}
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        {preview && (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginTop: 10,
            }}
          >
            {file.type.startsWith("image") ? (
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
              &times;
            </button>
          </div>
        )}

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
