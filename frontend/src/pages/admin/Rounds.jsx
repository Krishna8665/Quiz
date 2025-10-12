import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [numRounds, setNumRounds] = useState(1);
  const [rounds, setRounds] = useState([
    {
      name: "",
      timeLimitType: "perQuestion",
      timeLimitValue: "",
      category: "general",
      rules: { enablePass: false, enableNegative: false },
    },
  ]);

  const handleNumChange = (e) => {
    const count = Math.max(1, parseInt(e.target.value) || 1);
    setNumRounds(count);
    setRounds((prev) => {
      const newRounds = [...prev];
      while (newRounds.length < count) {
        newRounds.push({
          name: "",
          timeLimitType: "perQuestion",
          timeLimitValue: "",
          category: "general",
          rules: { enablePass: false, enableNegative: false },
        });
      }
      return newRounds.slice(0, count);
    });
  };

  const handleRoundChange = (index, field, value) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleRuleChange = (index, rule) => {
    setRounds((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, rules: { ...r.rules, [rule]: !r.rules[rule] } }
          : r
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quizName.trim()) {
      toast.error("Please enter a quiz name");
      return;
    }

    try {
      const payload = {
        name: quizName,
        rounds,
      };

      const res = await axios.post(
        "http://localhost:3000/api/quiz/create-quiz",
        payload,
        { withCredentials: true }
      );

      toast.success("✅ Quiz created successfully!");
      setQuizName("");
      setNumRounds(1);
      setRounds([
        {
          name: "",
          timeLimitType: "perQuestion",
          timeLimitValue: "",
          category: "general",
          rules: { enablePass: false, enableNegative: false },
        },
      ]);
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error(
        err.response?.data?.message || "❌ Failed to create quiz. Try again."
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "50px auto",
        padding: 25,
        border: "1px solid #ccc",
        borderRadius: 12,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Toaster position="top-center" />
      <h2 style={{ textAlign: "center", color: "black" }}>🧩 Create Quiz</h2>

      <form onSubmit={handleSubmit}>
        {/* QUIZ NAME */}
        <label style={{ color: "black" }}>Quiz Name:</label>
        <input
          type="text"
          placeholder="Enter quiz name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "100%",
            marginBottom: 20,
          }}
        />

        {/* NUMBER OF ROUNDS */}
        <label style={{ color: "black" }}>Number of Rounds:</label>
        <input
          type="number"
          min="1"
          value={numRounds}
          onChange={handleNumChange}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 20,
          }}
        />

        {/* ROUND DETAILS */}
        {rounds.map((round, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
              backgroundColor: "#fafafa",
            }}
          >
            <h4 style={{ color: "black" }}>Round {index + 1}</h4>

            {/* Round Name */}
            <label style={{ color: "black" }}>Round Name:</label>
            <input
              type="text"
              placeholder="Enter round name"
              value={round.name}
              onChange={(e) => handleRoundChange(index, "name", e.target.value)}
              required
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            />

            {/* Time Type */}
            <label style={{ color: "black" }}>Time Limit Type:</label>
            <select
              value={round.timeLimitType}
              onChange={(e) =>
                handleRoundChange(index, "timeLimitType", e.target.value)
              }
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            >
              <option value="perQuestion">Per Question</option>
              <option value="perRound">Per Round</option>
            </select>

            {/* Time Value */}
            <label style={{ color: "black" }}>Time (in seconds):</label>
            <input
              type="number"
              placeholder="e.g., 30"
              value={round.timeLimitValue}
              onChange={(e) =>
                handleRoundChange(index, "timeLimitValue", e.target.value)
              }
              required
              min="1"
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            />

            {/* Rules */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ color: "black", fontSize: "18px" }}>Rules</label>

              <label style={{ color: "black" }}>
                <input
                  type="checkbox"
                  checked={round.rules.enablePass}
                  onChange={() => handleRuleChange(index, "enablePass")}
                  style={{ marginRight: 8 }}
                />
                Enable Pass Functionality
              </label>

              <label style={{ color: "black" }}>
                <input
                  type="checkbox"
                  checked={round.rules.enableNegative}
                  onChange={() => handleRuleChange(index, "enableNegative")}
                  style={{ marginRight: 8 }}
                />
                Enable Point Reduction on Wrong Question
              </label>
            </div>

            {/* Category */}
            <label style={{ color: "black", marginTop: 10 }}>Category:</label>
            <select
              value={round.category}
              onChange={(e) =>
                handleRoundChange(index, "category", e.target.value)
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 10,
              }}
            >
              <option value="general">General Round</option>
              <option value="subject">Subject Round</option>
              <option value="estimation">Estimation Round</option>
              <option value="rapidfire">Rapid Fire Round</option>
              <option value="buzzer">Buzzer Round</option>
            </select>
          </div>
        ))}

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
            width: "100%",
          }}
        >
          Create Quiz
        </button>
      </form>
    </div>
  );
}
