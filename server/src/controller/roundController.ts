import { Request, Response } from "express";
import mongoose from "mongoose";
import Round from "../models/createRounds";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string; // User's MongoDB _id as string
    role: string; // User's role, e.g., "admin" or "user"
  };
}

// Create Round

export const createRound = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { rounds } = req.body; // expect an array of rounds

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!rounds || !Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({ message: "No rounds provided" });
    }

    // Validate each round
    for (const round of rounds) {
      if (!round.name || !round.timeLimitValue) {
        return res
          .status(400)
          .json({ message: "Each round must have name and time value" });
      }
    }

    // Check for duplicate round names
    const names = rounds.map((r) => r.name);
    const existing = await Round.find({ name: { $in: names }, adminId });
    if (existing.length > 0) {
      return res.status(400).json({
        message: `Duplicate round names: ${existing
          .map((r) => r.name)
          .join(", ")}`,
      });
    }

    // Create rounds
    const newRounds = await Round.insertMany(
      rounds.map((r) => ({
        name: r.name,
        category: r.category,
        timeLimitType: r.timeLimitType,
        timeLimitValue: r.timeLimitValue,
        adminId,
        rules: {
          enablePass: r.rules?.enablePass || false,
          enableNegative: r.rules?.enableNegative || false,
        },
      }))
    );

    res.status(201).json({
      message: "Rounds created successfully",
      rounds: newRounds,
    });
  } catch (error: any) {
    console.error("Error creating rounds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRounds = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin ID missing" });
    }

    // Find rounds created by this admin
    const rounds = await Round.find({ adminId })
      .populate("adminId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Rounds fetched successfully",
      rounds,
    });
  } catch (error: any) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE a round by ID
export const deleteRound = async (req: AuthRequest, res: Response) => {
  try {
    const roundId = req.params.id;
    const adminId = req.user?.id;

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ message: "Invalid round ID" });
    }

    if (!adminId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin ID missing" });
    }

    // Find the round created by this admin
    const round = await Round.findOne({ _id: roundId, adminId });
    if (!round) {
      return res
        .status(404)
        .json({ message: "Round not found or not owned by you" });
    }

    await Round.findByIdAndDelete(roundId);

    res.status(200).json({ message: "Round deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting round:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get All Rounds
// export const getRounds = async (req: Request, res: Response) => {
//   try {
//     //const adminId = req.user?.id;
//     //if (!adminId) return res.status(401).json({ message: "Unauthorized" });

//     const rounds = await Round.find({ adminId }).sort({ createdAt: -1 });
//     res.status(200).json(rounds);
//   } catch (error: any) {
//     console.error("Error fetching rounds:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// Delete Round
// export const deleteRound = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params; // ✅ Now typed correctly
//     const adminId = req.user?.id;

//     if (!adminId) return res.status(401).json({ message: "Unauthorized" });

//     const round = await Round.findOneAndDelete({ _id: id, adminId });
//     if (!round) return res.status(404).json({ message: "Round not found" });

//     res.status(200).json({ message: "Round deleted successfully" });
//   } catch (error: any) {
//     console.error("Error deleting round:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
