import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function Team() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch teams from backend
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/team/teams");
      setTeams(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch teams:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Add new team
  const handleAdd = async () => {
    if (!teamName.trim()) return;
    try {
      const res = await axiosInstance.post("/team/teams", {
        name: teamName.trim(),
      });
      setTeams((prev) => [...prev, res.data]); // backend returns created team object
      setTeamName("");
    } catch (err) {
      console.error("Failed to add team:", err.response?.data || err.message);
      console.log(error)
    }
  };

  // Remove team
  const handleRemove = async (id) => {
    try {
      await axiosInstance.delete(`/team/teams/${id}`);
      setTeams((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(
        "Failed to remove team:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #171616",
        borderRadius: 8,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Team Manager</h2>

      {/* Input + Add Button */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #111",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "8px 12px",
            borderRadius: 4,
            border: "none",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Team List */}
      <div style={{ marginBottom: 20 }}>
        <h4>Teams you added:</h4>
        {loading ? (
          <p>Loading teams...</p>
        ) : teams.length === 0 ? (
          <p style={{ color: "#050202ff" }}>No teams added yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {teams.map((team) => (
              <li
                key={team._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  border: "1px solid #080707ff",
                  borderRadius: 4,
                  marginBottom: 6,
                  color: "black",
                }}
              >
                {team.name} <span>({team.points} pts)</span>
                <button
                  onClick={() => handleRemove(team._id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "none",
                    background: "#ff4d4f",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => navigate("/team-list")}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          background: "#28a745",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
}
