import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Round from "../models/createRounds";
import Question from "../models/question";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// 🟢 Create Round(s)
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

    // ✅ Validate each round
    for (const round of rounds) {
      if (!round.name || !round.timeLimitValue) {
        return res.status(400).json({
          message: "Each round must have name and time value",
        });
      }
    }

    // ✅ Check for duplicate round names under same admin
    const names = rounds.map((r) => r.name);
    const existing = await Round.find({ name: { $in: names }, adminId });
    if (existing.length > 0) {
      return res.status(400).json({
        message: `Duplicate round names: ${existing
          .map((r) => r.name)
          .join(", ")}`,
      });
    }

    // ✅ Prevent reusing questions across rounds
    const usedQuestionIds: string[] = [];
    for (const r of rounds) {
      if (r.questions?.length) {
        const duplicate = r.questions.some((qId: string) =>
          usedQuestionIds.includes(qId.toString())
        );
        if (duplicate) {
          return res.status(400).json({
            message: "A question is being reused across multiple rounds.",
          });
        }
        usedQuestionIds.push(...r.questions.map((id: string) => id.toString()));
      }
    }

    const validCategories = [
      "general round",
      "subject round",
      "estimation round",
      "rapid fire round",
      "buzzer round",
    ];
    const validTimeLimitTypes = ["perRound", "perQuestion"];

    for (const round of rounds) {
      if (!validCategories.includes(round.category)) {
        return res
          .status(400)
          .json({ message: `Invalid category: ${round.category}` });
      }
      if (!validTimeLimitTypes.includes(round.timeLimitType)) {
        return res
          .status(400)
          .json({ message: `Invalid timeLimitType: ${round.timeLimitType}` });
      }
      for (const round of rounds) {
        if (
          !round.name ||
          !round.timeLimitValue ||
          !round.category ||
          !round.timeLimitType
        ) {
          return res.status(400).json({
            message:
              "Each round must include name, category, time limit type, and time limit value",
          });
        }
      }
    }
    const categories = rounds.map((r) => r.category);
    const existingCategories = await Round.find({
      adminId,
      category: { $in: categories },
    });
    if (existingCategories.length > 0) {
      return res.status(400).json({
        message: `These round categories already exist: ${existingCategories
          .map((r) => r.category)
          .join(", ")}`,
      });
    }

    // ✅ Create all rounds
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
        questions: r.questions || [],
      }))
    );

    // ✅ Update each question to link to its round
    for (const round of newRounds) {
      if (round.questions?.length) {
        await Question.updateMany(
          { _id: { $in: round.questions } },
          { $set: { roundId: round._id } }
        );
      }
    }

    res.status(201).json({
      message: "✅ Rounds created successfully",
      rounds: newRounds,
    });
  } catch (error: any) {
    console.error("Error creating rounds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🟡 Get All Rounds for Admin
export const getRounds = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin ID missing" });
    }

    const rounds = await Round.find({ adminId })
      .populate("questions", "text category points") // show questions info
      .populate("adminId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "✅ Rounds fetched successfully",
      rounds,
    });
  } catch (error: any) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔴 Delete a Round by ID
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

    const round = await Round.findOne({ _id: roundId, adminId });
    if (!round) {
      return res
        .status(404)
        .json({ message: "Round not found or not owned by you" });
    }

    // Unassign questions linked to this round
    await Question.updateMany(
      { roundId: round._id },
      { $unset: { roundId: "" } }
    );

    await Round.findByIdAndDelete(roundId);

    res.status(200).json({ message: "✅ Round deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting round:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
