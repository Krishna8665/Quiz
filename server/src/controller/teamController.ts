import { Request, Response } from "express";
import Team from "../models/team";

// ✅ Extend Request type locally
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}

// Add a new team
export const addTeam = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = new Team({ name, adminId });
    await team.save();

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add team", error: err });
  }
};

// Get all teams
export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teams", error: err });
  }
};

// Delete a team
export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Team removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete team", error: err });
  }
};

// Increase team points
export const addPoints = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (!points || isNaN(points)) {
      return res.status(400).json({ message: "Points must be a number" });
    }

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.points += points;
    await team.save();

    res.json({ message: "Points added", team });
  } catch (err) {
    res.status(500).json({ message: "Failed to add points", error: err });
  }
};

// Reduce team points by 5
export const reducePoints = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.points -= 5;
    if (team.points < 0) team.points = 0;

    await team.save();

    res.json({ message: "5 points deducted", team });
  } catch (err) {
    res.status(500).json({ message: "Failed to reduce points", error: err });
  }
};
