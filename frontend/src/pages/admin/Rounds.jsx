import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CreateQuiz() {
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]); // globally used questions

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [numTeams, setNumTeams] = useState(1);
  const [numRounds, setNumRounds] = useState(1);

  const [rounds, setRounds] = useState([
    {
      name: "",
      timeLimitType: "perQuestion",
      timeLimitValue: "",
      category: "general",
      rules: { enablePass: false, enableNegative: false },
      questions: [],
    },
  ]);

  const [quizName, setQuizName] = useState("");

  // ✅ Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/team/teams", {
          withCredentials: true,
        });
        setTeams(res.data);
      } catch (err) {
        console.error("Error fetching teams:", err);
        toast.error("Failed to fetch teams");
      }
    };
    fetchTeams();
  }, []);

  // ✅ Fetch questions
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

  // ✅ Handle number of rounds
  const handleNumRoundsChange = (e) => {
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
          questions: [],
        });
      }
      return newRounds.slice(0, count);
    });
  };

  // ✅ Handle round data change
  const handleRoundChange = (index, field, value) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  // ✅ Only one rule can be selected
  const handleRuleChange = (index, rule) => {
    setRounds((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        return {
          ...r,
          rules: {
            enablePass: rule === "enablePass",
            enableNegative: rule === "enableNegative",
          },
        };
      })
    );
  };

  // ✅ Handle question select/unselect per round
  const handleQuestionSelect = (roundIndex, questionId) => {
    setRounds((prevRounds) => {
      const newRounds = prevRounds.map((r, i) => {
        if (i !== roundIndex) return r;
        const round = { ...r };
        const isSelected = round.questions.includes(questionId);

        if (isSelected) {
          // Unselect question
          round.questions = round.questions.filter((id) => id !== questionId);
        } else {
          // Select question
          round.questions.push(questionId);
        }
        return round;
      });

      // Update usedQuestions globally (lock question if used in any round)
      const allSelected = newRounds.flatMap((r) => r.questions);
      setUsedQuestions(allSelected);

      return newRounds;
    });
  };

  // ✅ Submit quiz
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/api/quiz/create-quiz",
        {
          name: quizName,
          numTeams,
          teams: selectedTeams,
          rounds,
        },
        { withCredentials: true }
      );

      toast.success("✅ Quiz created successfully!");
      setQuizName("");
      setNumTeams(1);
      setSelectedTeams([]);
      setNumRounds(1);
      setRounds([
        {
          name: "",
          timeLimitType: "perQuestion",
          timeLimitValue: "",
          category: "general",
          rules: { enablePass: false, enableNegative: false },
          questions: [],
        },
      ]);
      setUsedQuestions([]);
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error(err.response?.data?.message || "❌ Failed to create quiz");
    }
  };

  return (
    <div
      style={{
        maxWidth: 750,
        margin: "60px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Toaster position="top-center" />
      <h2 style={{ textAlign: "center", color: "black" }}>Create Quiz</h2>

      <form onSubmit={handleSubmit}>
        {/* Quiz name */}
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
            marginBottom: 15,
          }}
        />

        {/* Number of rounds */}
        <label style={{ color: "black" }}>Number of Rounds:</label>
        <input
          type="number"
          value={numRounds}
          min="1"
          onChange={handleNumRoundsChange}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "100%",
            marginBottom: 20,
          }}
        />

        {/* Rounds list */}
        {rounds.map((round, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 15,
              marginBottom: 20,
            }}
          >
            <h3 style={{ color: "black" }}>Round {index + 1}</h3>

            {/* Round name */}
            <label style={{ color: "black" }}>Name:</label>
            <input
              type="text"
              value={round.name}
              onChange={(e) => handleRoundChange(index, "name", e.target.value)}
              required
              placeholder="Enter round name"
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            />

            {/* Category */}
            <label style={{ color: "black" }}>Category:</label>
            <select
              value={round.category}
              onChange={(e) =>
                handleRoundChange(index, "category", e.target.value)
              }
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            >
              <option value="general round">General Round</option>
              <option value="subject round">Subject Round</option>
              <option value="estimation round">Estimation Round</option>
              <option value="rapid fire round">Rapid Fire Round</option>
              <option value="buzzer round">Buzzer Round</option>
            </select>

            {/* Time Limit Type */}
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

            {/* Time Limit */}
            <label style={{ color: "black" }}>Time Limit (seconds):</label>
            <input
              type="number"
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

            {/* Question Selector */}
            <label style={{ color: "black" }}>Select Questions:</label>
            <div
              style={{
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: 10,
                borderRadius: 6,
                background: "#f9f9f9",
              }}
            >
              {questions.map((q) => {
                const isUsed =
                  usedQuestions.includes(q._id) &&
                  !round.questions.includes(q._id);
                return (
                  <label
                    key={q._id}
                    style={{
                      display: "block",
                      opacity: isUsed ? 0.5 : 1,
                      color: isUsed ? "gray" : "black",
                      cursor: isUsed ? "not-allowed" : "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={isUsed}
                      checked={round.questions.includes(q._id)}
                      onChange={() => handleQuestionSelect(index, q._id)}
                      style={{ marginRight: 8 }}
                    />
                    {q.text}
                  </label>
                );
              })}
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
          Create Quiz
        </button>
      </form>
    </div>
  );
}
