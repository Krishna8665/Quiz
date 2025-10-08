import {Request, Response } from "express";
import mongoose from "mongoose";
import Round from "../models/createRounds";
import jwt from "jsonwebtoken";




export interface AuthRequest extends Request {
  user?: {
    id: string;    // User's MongoDB _id as string
    role: string;  // User's role, e.g., "admin" or "user"
  };
}

// Create Round

export const createRound = async (req: AuthRequest, res: Response) => {
  try {
    const { name, timePerQuestion } = req.body;

    if (!name || !timePerQuestion) {
      return res
        .status(400)
        .json({ message: "Name and time per question are required" });
    }

    // Prevent duplicates
    const existingRound = await Round.findOne({ name });
    if (existingRound) {
      return res
        .status(400)
        .json({ message: "Round with this name already exists" });
    }

    // req.user is set by authMiddleware
    const newRound = new Round({
      name,
      timePerQuestion,
      adminId: req.user?.id, // ✅ attach adminId here
    });

    await newRound.save();

    res.status(201).json({
      message: "Round created successfully",
      round: newRound,
    });
  } catch (error: any) {
    console.error("Error creating round:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRounds = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized: Admin ID missing" });
    }

    // Find rounds created by this admin
    const rounds = await Round.find({ adminId }).populate("adminId", "name email");

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
      return res.status(401).json({ message: "Unauthorized: Admin ID missing" });
    }

    // Find the round created by this admin
    const round = await Round.findOne({ _id: roundId, adminId });
    if (!round) {
      return res.status(404).json({ message: "Round not found or not owned by you" });
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
