import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CreateQuiz() {
  const [step, setStep] = useState(1);
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
      regulation: { description: "" },
      questions: [],
    },
  ]);
  const [questions, setQuestions] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

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
        console.error(err);
        toast.error("Failed to fetch questions");
      }
    };
    fetchQuestions();
  }, []);

  // ✅ Team Handlers
  const addTeam = () => setTeams([...teams, { name: "" }]);
  const removeTeam = (i) => setTeams(teams.filter((_, index) => index !== i));
  const handleTeamChange = (i, value) => {
    const updated = [...teams];
    updated[i].name = value;
    setTeams(updated);
  };

  // ✅ Round Handlers
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
          regulation: { description: "" },
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

  const handleRegulationChange = (index, value) => {
    const updated = [...rounds];
    updated[index].regulation.description = value;
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

  // ✅ Question selection
  const handleQuestionSelect = (roundIndex, questionId) => {
    const updatedRounds = [...rounds];
    const round = updatedRounds[roundIndex];

    if (round.questions.includes(questionId)) {
      round.questions = round.questions.filter((id) => id !== questionId);
    } else {
      round.questions.push(questionId);
    }

    const allSelected = updatedRounds.flatMap((r) => r.questions);
    setUsedQuestions(allSelected);

    updatedRounds[roundIndex] = round;
    setRounds(updatedRounds);
  };

  // ✅ Custom checkbox (green tick fix)
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

  // ✅ Submit
  const handleSubmit = async () => {
    if (!quizName.trim()) return toast.error("Please enter quiz name");

    if (teams.some((t) => !t.name.trim()))
      return toast.error("All teams must have a name");

    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];

      if (!round.name.trim())
        return toast.error(`Please enter a name for Round ${i + 1}`);

      if (!round.category)
        return toast.error(`Select category for Round ${i + 1}`);

      if (!round.timeLimitType)
        return toast.error(`Select time limit type for Round ${i + 1}`);

      if (!round.timeLimitValue || round.timeLimitValue <= 0)
        return toast.error(`Enter a valid time limit for Round ${i + 1}`);

      if (round.points === "" || round.points < 0)
        return toast.error(`Enter valid points for Round ${i + 1}`);

      if (!round.regulation.description.trim())
        return toast.error(`Enter regulation for Round ${i + 1}`);

      if (!round.questions || round.questions.length === 0)
        return toast.error(`Select at least one question for Round ${i + 1}`);
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3000/api/quiz/create-quiz",
        { name: quizName, teams, rounds },
        { withCredentials: true }
      );
      toast.success("✅ Quiz created successfully!");

      // Reset
      setStep(1);
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
          regulation: { description: "" },
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
      <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "28px" }}>
        🧠 Create New Quiz
      </h1>

      {/* Step Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: "30%",
              textAlign: "center",
              padding: 8,
              borderRadius: 6,
              background: step === s ? "#28a745" : "#ccc",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => setStep(s)}
          >
            Step {s}
          </div>
        ))}
      </div>

      {/* Step 1 - Quiz Info */}
      {step === 1 && (
        <div>
          <section
            style={{
              background: "#f8f9fa",
              padding: 20,
              borderRadius: 10,
              marginTop: 25,
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "28px",
              }}
            >
              Quiz Info :
            </h3>
            <label style={{ color: "black" }}>Quiz Name:</label>
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 20,
              }}
            />
          </section>
          <button
            type="button"
            onClick={() => setStep(2)}
            style={{
              padding: 10,
              borderRadius: 6,
              background: "#28a745",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2 - Teams */}
      {step === 2 && (
        <div>
          <label style={{ color: "black" }}>👥 Teams:</label>
          {teams.map((team, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
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
          <div style={{ display: "flex", justifyContent: "space-between"}}>
            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              style={{
                padding: 10,
                borderRadius: 6,
                background: "#28a745",
                color: "#fff",
                border: "700px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Rounds */}
      {step === 3 && (
        <div>
          <label style={{ color: "black" }}>🔄 Number of Rounds:</label>
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
              <h3 style={{ color: "black", marginBottom: 10 }}>
                🏆 Round {index + 1}
              </h3>

              {/* Round Name */}
              <label style={{ color: "black" }}>Name:</label>
              <input
                type="text"
                value={round.name}
                onChange={(e) =>
                  handleRoundChange(index, "name", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
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

              {/* Time limit */}
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

              {/* Points */}
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

              {/* ✅ Regulation */}
              <label style={{ color: "black" }}>Regulation Description:</label>
              <textarea
                value={round.regulation.description}
                onChange={(e) =>
                  handleRegulationChange(index, e.target.value)
                }
                placeholder="Enter any special rules or regulation for this round..."
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  marginBottom: 10,
                  minHeight: 60,
                }}
              />

              {/* Rules */}
              <label style={{ color: "black", fontWeight: "bold" }}>
                Rules:
              </label>
              <div style={{ marginBottom: 10 }}>
                {[
                  { id: "enablePass", label: "Enable Pass" },
                  { id: "enableNegative", label: "Enable Negative Points" },
                ].map((rule) => (
                  <label
                    key={rule.id}
                    style={{
                      color: "black",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginBottom: 6,
                    }}
                  >
                    <input
                      type="radio"
                      name={`rule-${index}`}
                      checked={round.rules[rule.id]}
                      onChange={() => handleRuleChange(index, rule.id)}
                      style={{
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        width: 18,
                        height: 18,
                        border: "2px solid #28a745",
                        borderRadius: "50%",
                        cursor: "pointer",
                        marginRight: 8,
                        position: "relative",
                        backgroundColor: round.rules[rule.id]
                          ? "#28a745"
                          : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                    />
                    {rule.label}
                  </label>
                ))}
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
                        cursor: selectedInOtherRound
                          ? "not-allowed"
                          : "pointer",
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

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: 10,
                borderRadius: 6,
                background: loading ? "#ccc" : "green",
                color: "#fff",
                border: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
