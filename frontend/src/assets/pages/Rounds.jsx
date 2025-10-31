import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [teams, setTeams] = useState([{ name: "" }]);
  const [numRounds, setNumRounds] = useState(1);
  const [rounds, setRounds] = useState([
    {
      name: "",
      category: "general round",
      timeLimitType: "perQuestion",
      timeLimitValue: 30,
      points: 0,
      rules: { enablePass: false, enableNegative: false },
      questions: [],
    },
  ]);
  const [questions, setQuestions] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Questions from database
useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/question/get-questions",
          { withCredentials: true }
        );
        setQuestions(res.data.data || []);
      } catch (err) {
        console.error("Error fetching questions:", err);
        toast.error("Failed to fetch questions");
      }
    };
    fetchQuestions();
  }, []);
  // Handle Team Changes
  const addTeam = () => setTeams([...teams, { name: "" }]);
  const removeTeam = (i) => setTeams(teams.filter((_, index) => index !== i));
  const handleTeamChange = (i, value) => {
    const updated = [...teams];
    updated[i].name = value;
    setTeams(updated);
  };

  // Handle Rounds changes
  const handleNumRoundsChange = (e) => {
    const count = Math.max(1, parseInt(e.target.value) || 1);
    setNumRounds(count);

    setRounds((prev) => {
      const updated = [...prev];
      while (updated.length < count) {
        updated.push({
          name: "",
          category: "general round",
          timeLimitType: "perQuestion",
          timeLimitValue: 30,
          points: 0,
          rules: { enablePass: false, enableNegative: false },
          questions: [],
        });
      }
      return updated.slice(0, count);
    });
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  const handleRuleChange = (index, rule) => {
    const updated = [...rounds];
    updated[index].rules = {
      enablePass: rule === "enablePass",
      enableNegative: rule === "enableNegative",
    };
    setRounds(updated);
  };

  // Handle question selection with no duplicate in other rounds
  const handleQuestionSelect = (roundIndex, questionId) => {
    const updatedRounds = [...rounds];
    const round = updatedRounds[roundIndex];

    if (round.questions.includes(questionId)) {
      // Deselect question
      round.questions = round.questions.filter((id) => id !== questionId);
    } else {
      // Select question
      round.questions.push(questionId);
    }

    // Update all used questions across rounds
    const allSelected = updatedRounds.flatMap((r) => r.questions);
    setUsedQuestions(allSelected);

    updatedRounds[roundIndex] = round;
    setRounds(updatedRounds);
  };

  // Custom Checkbox component
  const Checkbox = ({ checked }) => (
    <span
      style={{
        width: 20,
        height: 20,
        border: "1px solid #000",
        display: "inline-block",
        marginRight: 8,
        backgroundColor: checked ? "green" : "#fff",
        borderRadius: 4,
        position: "relative",
      }}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          style={{ position: "absolute", top: 2, left: 2, fill: "white" }}
        >
          <path d="M20.285 6.709l-11.025 11.025-5.545-5.545 1.414-1.414 4.131 4.131 9.611-9.611z" />
        </svg>
      )}
    </span>
  );

  // Submit Quiz
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quizName.trim()) {
      toast.error("Please enter quiz name");
      return;
    }

    if (teams.some((t) => !t.name.trim())) {
      toast.error("All teams must have a name");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3000/api/quiz/create-quiz",
        { name: quizName, teams, rounds },
        { withCredentials: true }
      );

      toast.success("✅ Quiz created successfully!");
      setQuizName("");
      setTeams([{ name: "" }]);
      setNumRounds(1);
      setRounds([
        {
          name: "",
          category: "general round",
          timeLimitType: "perQuestion",
          timeLimitValue: 30,
          points: 0,
          rules: { enablePass: false, enableNegative: false },
          questions: [],
        },
      ]);
      setUsedQuestions([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Toaster position="top-center" />
      <h2 style={{ textAlign: "center", color: "black" }}>Create Quiz</h2>

      <form onSubmit={handleSubmit}>
        {/* Quiz Name */}
        <label style={{ color: "black" }}>Quiz Name:</label>
        <input
          type="text"
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

        {/* Teams */}
        <label style={{ color: "black" }}>Teams:</label>
        {teams.map((team, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
          >
            <input
              type="text"
              placeholder={`Team ${index + 1} Name`}
              value={team.name}
              onChange={(e) => handleTeamChange(index, e.target.value)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
            {teams.length > 1 && (
              <button
                type="button"
                onClick={() => removeTeam(index)}
                style={{
                  marginLeft: 8,
                  padding: "6px 10px",
                  background: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTeam}
          style={{
            marginBottom: 20,
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ➕ Add Team
        </button>

        {/* Number of Rounds */}
        <label style={{ color: "black" }}>Number of Rounds:</label>
        <input
          type="number"
          min="1"
          value={numRounds}
          onChange={handleNumRoundsChange}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "100%",
            marginBottom: 20,
          }}
        />

        {/* Round Details */}
        {rounds.map((round, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 15,
              marginBottom: 20,
              background: "#fafafa",
            }}
          >
            <h3 style={{ color: "black" }}>Round {index + 1}</h3>

            <label style={{ color: "black" }}>Name:</label>
            <input
              type="text"
              value={round.name}
              onChange={(e) => handleRoundChange(index, "name", e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 10,
              }}
            />

            <label style={{ color: "black" }}>Category:</label>
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
              <option value="general round">General Round</option>
              <option value="subject round">Subject Round</option>
              <option value="estimation round">Estimation Round</option>
              <option value="rapid fire round">Rapid Fire Round</option>
              <option value="buzzer round">Buzzer Round</option>
            </select>

            <label style={{ color: "black" }}>Time Limit Type:</label>
            <select
              value={round.timeLimitType}
              onChange={(e) =>
                handleRoundChange(index, "timeLimitType", e.target.value)
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 10,
              }}
            >
              <option value="perQuestion">Per Question</option>
              <option value="perRound">Per Round</option>
            </select>

            <label style={{ color: "black" }}>Time Limit (seconds):</label>
            <input
              type="number"
              value={round.timeLimitValue}
              min="1"
              onChange={(e) =>
                handleRoundChange(index, "timeLimitValue", e.target.value)
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 10,
              }}
            />

            <label style={{ color: "black" }}>Points:</label>
            <input
              type="number"
              value={round.points}
              min="0"
              onChange={(e) =>
                handleRoundChange(index, "points", e.target.value)
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 10,
              }}
            />

            {/* Rules */}
            <label style={{ color: "black", fontWeight: "bold" }}>Rules:</label>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: "black" }}>
                <input
                  type="radio"
                  name={`rule-${index}`}
                  checked={round.rules.enablePass}
                  onChange={() => handleRuleChange(index, "enablePass")}
                  style={{ marginRight: 8 }}
                />
                Enable Pass
              </label>
              <br />
              <label style={{ color: "black" }}>
                <input
                  type="radio"
                  name={`rule-${index}`}
                  checked={round.rules.enableNegative}
                  onChange={() => handleRuleChange(index, "enableNegative")}
                  style={{ marginRight: 8 }}
                />
                Enable Negative Points
              </label>
            </div>

            {/* Questions */}
            <label style={{ color: "black" }}>Select Questions:</label>
            <div
              style={{
                maxHeight: 150,
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: 10,
                background: "#f9f9f9",
              }}
            >
              {questions.map((q) => {
                const selectedInOtherRound =
                  usedQuestions.includes(q._id) &&
                  !round.questions.includes(q._id);
                const checked = round.questions.includes(q._id);

                return (
                  <label
                    key={q._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      opacity: selectedInOtherRound ? 0.5 : 1,
                      marginBottom: 5,
                      cursor: selectedInOtherRound ? "not-allowed" : "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={selectedInOtherRound}
                      checked={checked}
                      onChange={() => handleQuestionSelect(index, q._id)}
                      style={{ display: "none" }}
                    />
                    <Checkbox checked={checked} />
                    {q.text}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            fontWeight: 600,
            color: "#fff",
            background: loading ? "#ccc" : "green",
            borderRadius: 6,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
}
