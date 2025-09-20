import { Request, Response } from "express";
import Team from "../models/team";

// Add a team with points
export const addTeam = async (req: Request, res: Response) => {
  try {
    const { name, points } = req.body;
    if (!name) return res.status(400).json({ message: "Team name is required" });

    const team = new Team({ name, points: points || 0 });
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Failed to add team", error: err });
  }
};

// Get all teams
export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teams", error: err });
  }
};

// Delete a team
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Team removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete team", error: err });
  }
};

// Update team points
export const updatePoints = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.points = points;
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Failed to update points", error: err });
  }
};
