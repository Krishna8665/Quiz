import { Request, Response } from "express";
import mongoose from "mongoose";
import Round from "../models/createRounds"; 
import { IRound } from "../models/createRounds";
import { AuthRequest } from "./types";
import Question from "../models/question";

// ✅ Create Round Controller
export const createRound = async (req: Request, res: Response) => {
  try {
    const {
      roundNumber,
      name,
      category,
      timeLimitType,
      timeLimitValue,
      points,
      rules,
      regulation,
      questions,
      adminId,
    } = req.body;

    // ✅ Basic Validation
    if (!roundNumber || !name || !category || !timeLimitType || !timeLimitValue || !adminId) {
      return res.status(400).json({
        message: "❌ Please fill all required fields (roundNumber, name, category, timeLimitType, timeLimitValue, adminId).",
      });
    }

    // ✅ Category validation
    const validCategories = [
      "general round",
      "subject round",
      "estimation round",
      "rapid fire round",
      "buzzer round",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "❌ Invalid category type." });
    }

    // ✅ Time limit type validation
    const validTimeTypes = ["perRound", "perQuestion"];
    if (!validTimeTypes.includes(timeLimitType)) {
      return res.status(400).json({ message: "❌ Invalid time limit type." });
    }

    // ✅ Rules Validation
    if (!rules) {
      return res.status(400).json({ message: "❌ Rules object is required." });
    }

    const {
      enablePass,
      passLimit,
      enableNegative,
      negativePoints,
      firstHandQuestions,
      firstHandPoints,
      passedPoints,
      passCondition,
      passedTime,
      firstHandTime,
    } = rules;

    // Required fields inside rules
    if (enablePass && !passCondition) {
      return res.status(400).json({ message: "❌ Pass condition is required when passing is enabled." });
    }

    if (passCondition === "onceToNextTeam" && (!passedTime || passedTime <= 0)) {
      return res.status(400).json({
        message: "❌ Passed time must be provided when passCondition is 'onceToNextTeam'.",
      });
    }

    if (enableNegative && (negativePoints === undefined || negativePoints === null)) {
      return res.status(400).json({
        message: "❌ Negative points must be set when negative marking is enabled.",
      });
    }

    if (!firstHandQuestions || firstHandQuestions <= 0) {
      return res.status(400).json({
        message: "❌ Please specify number of first-hand questions per team.",
      });
    }

    if (!firstHandPoints || firstHandPoints <= 0) {
      return res.status(400).json({
        message: "❌ Please set points for first-hand correct answers.",
      });
    }

    if (!passedPoints && passCondition === "onceToNextTeam") {
      return res.status(400).json({
        message: "❌ Please set points for passed question answers.",
      });
    }

    // ✅ Regulation Validation
    if (!regulation || !regulation.description) {
      return res.status(400).json({
        message: "❌ Regulation description is required.",
      });
    }

    // ✅ Create Round Document
    const newRound: IRound = new Round({
      roundNumber,
      name,
      category,
      timeLimitType,
      timeLimitValue,
      points: points || 0,
      rules: {
        enablePass: enablePass ?? false,
        passLimit: passLimit ?? 0,
        enableNegative: enableNegative ?? false,
        negativePoints: negativePoints ?? 0,
        firstHandQuestions,
        firstHandPoints,
        passedPoints: passedPoints ?? 0,
        passCondition: passCondition || "noPass",
        passedTime: passedTime ?? 0,
        firstHandTime: firstHandTime ?? 0,
      },
      regulation: {
        description: regulation.description,
      },
      questions: questions ? questions.map((q: string) => new mongoose.Types.ObjectId(q)) : [],
      adminId,
    });

    // ✅ Save to DB
    await newRound.save();

    res.status(201).json({
      message: "✅ Round created successfully.",
      round: newRound,
    });
  } catch (error: any) {
    console.error("Error creating round:", error);
    res.status(500).json({
      message: "❌ Failed to create round.",
      error: error.message,
    });
  }
};


// Get all rounds created by a specific admin
export const getRounds = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.params.adminId || req.user?.id;
    if (!adminId) {
      return res.status(400).json({ message: "❌ adminId is required." });
    }

    // Fetch rounds belonging to the admin, sorted by roundNumber
    const rounds = await Round.find({ adminId }).sort({ roundNumber: 1 });

    if (!rounds.length) {
      return res.status(200).json({ message: "No rounds found.", rounds: [] });
    }

    return res.status(200).json({
      message: "Rounds fetched successfully.",
      rounds,
    });
  } catch (error: any) {
    console.error("Error fetching rounds:", error);
    return res.status(500).json({
      message: "❌ Failed to fetch rounds.",
      error: error.message,
    });
  }
};


export const deleteRound = async (req: AuthRequest, res: Response) => {
  try {
    const { roundId } = req.params;
    const adminId = req.user?.id; // now TS knows user may exist

    if (!adminId) {
      return res.status(401).json({ message: "❌ Unauthorized" });
    }

    if (!roundId) {
      return res.status(400).json({ message: "❌ roundId is required." });
    }

    const round = await Round.findOne({ _id: roundId, adminId });
    if (!round) {
      return res.status(404).json({ message: "❌ Round not found." });
    }

     if (round.questions && round.questions.length > 0) {
      // Convert each ID to ObjectId to avoid type errors
      const questionIds = round.questions.map((q) =>
        typeof q === "string" ? new mongoose.Types.ObjectId(q) : q
      );

      await Question.updateMany(
        { _id: { $in: questionIds } },
        { $unset: { roundId: "" } }
      );
    }

    await Round.findByIdAndDelete(roundId);

    return res.status(200).json({ message: "✅ Round deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting round:", error);
    return res.status(500).json({
      message: "❌ Failed to delete round.",
      error: error.message,
    });
  }
};

