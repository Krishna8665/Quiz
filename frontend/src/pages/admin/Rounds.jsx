import React, { useState } from "react";
import axios from "axios";

export default function CreateRound() {
  const [numRounds, setNumRounds] = useState(1);
  const [rounds, setRounds] = useState([
    {
      name: "",
      timeLimitType: "perQuestion",
      timeLimitValue: "",
      rules: { enablePass: false, enableNegative: false },
    },
  ]);
  const [message, setMessage] = useState("");

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
          ? {
              ...r,
              rules: {
                ...r.rules,
                [rule]: !r.rules[rule],
              },
            }
          : r
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/round/create-rounds",
        { rounds },
        { withCredentials: true }
      );

      setMessage(res.data.message || "✅ Rounds created successfully!");
      setNumRounds(1);
      setRounds([
        {
          name: "",
          timeLimitType: "perQuestion",
          timeLimitValue: "",
          rules: { enablePass: false, enableNegative: false },
        },
      ]);
    } catch (err) {
      console.error("Error creating rounds:", err);
      setMessage(
        err.response?.data?.message || "❌ Failed to create rounds. Try again."
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "60px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "black" }}>
        Create Round(s) with Rules
      </h2>

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

      <form onSubmit={handleSubmit}>
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

        {rounds.map((round, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
            }}
          >
            <h4 style={{ color: "black" }}>Round {index + 1}</h4>

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

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ color: "black" ,fontSize:"20px" }}>Rules</label>
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
          Create Round(s)
        </button>
      </form>
    </div>
  );
}
