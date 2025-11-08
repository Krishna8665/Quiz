import { Request, Response } from "express";
import mongoose from "mongoose";
import Round from "../models/createRounds";
import Question from "../models/question";

// Interface for admin request
interface AdminRequest extends Request {
  body: any;
  params: { adminId?: string; roundId?: string };
}

/**
 * ✅ CREATE ROUND (with adminId)
 */
export const createRound = async (req: AdminRequest, res: Response) => {
  try {
    const {
      roundNumber,
      name,
      category,
      rules,
      adminId,
      questions = [],
    } = req.body;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId))
      return res.status(400).json({ message: "Invalid adminId" });

    if (!roundNumber || !name || !category || !rules)
      return res.status(400).json({ message: "Missing required fields." });

    const {
      assignQuestionType,
      numberOfQuestion,
      enableTimer,
      points,
      enablePass,
      passCondition,
      enableNegative,
      negativePoints,
    } = rules;

    // 🧩 Validation
    if (points === undefined || isNaN(points) || points < 0)
      return res
        .status(400)
        .json({ message: "rules.points must be a non-negative number." });

    if (!["forAllTeams", "forEachTeam"].includes(assignQuestionType))
      return res.status(400).json({
        message: "assignQuestionType must be 'forAllTeams' or 'forEachTeam'.",
      });

    if (typeof numberOfQuestion !== "number" || numberOfQuestion <= 0)
      return res
        .status(400)
        .json({ message: "numberOfQuestion must be a positive number." });

    if (assignQuestionType === "forAllTeams" && enableTimer === true)
      return res.status(400).json({
        message:
          "Timer cannot be enabled when assignQuestionType is 'forAllTeams'. Set enableTimer to false.",
      });

    if (enablePass && !passCondition)
      return res.status(400).json({
        message: "Pass condition must be set when enablePass is true.",
      });

    if (enableNegative && (negativePoints === undefined || negativePoints >= 0))
      return res.status(400).json({
        message:
          "negativePoints must be a negative number when enableNegative is true.",
      });

    // 🧠 Validate question pool
    const availableQuestions = await Question.find({ adminId });
    if (!availableQuestions || availableQuestions.length === 0)
      return res.status(400).json({
        message: `No questions found for this admin'.`,
      });

    if (availableQuestions.length < numberOfQuestion)
      return res.status(400).json({
        message: `Not enough questions available. Found ${availableQuestions.length}, need ${numberOfQuestion}.`,
      });

    // 🎯 Select Questions
    const selectedQuestions =
      questions.length > 0
        ? questions.slice(0, numberOfQuestion)
        : availableQuestions.slice(0, numberOfQuestion).map((q) => q._id);

    // 🆕 Create new round
    const newRound = await Round.create({
      roundNumber,
      name,
      category,
      rules: {
        ...rules,
        assignQuestionType,
        numberOfQuestion,
        points,
      },
      questions: selectedQuestions,
      adminId,
    });

    return res.status(201).json({
      message: "✅ Round created successfully.",
      round: newRound,
    });
  } catch (err: any) {
    console.error("Error creating round:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * ✅ GET ALL ROUNDS BY ADMIN
 */
export const getRounds = async (req: AdminRequest, res: Response) => {
  try {
    const { adminId } = req.params;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId))
      return res.status(400).json({ message: "Invalid adminId" });

    const rounds = await Round.find({ adminId }).populate("questions");

    if (rounds.length === 0)
      return res
        .status(404)
        .json({ message: "No rounds found for this admin." });

    return res.status(200).json({ count: rounds.length, rounds });
  } catch (err: any) {
    console.error("Error fetching rounds:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * ✅ GET SINGLE ROUND BY ID
 */
export const getRoundById = async (req: AdminRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId))
      return res.status(400).json({ message: "Invalid roundId" });

    const round = await Round.findById(roundId).populate("questions");

    if (!round) return res.status(404).json({ message: "Round not found." });

    return res.status(200).json({ round });
  } catch (err: any) {
    console.error("Error fetching round:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * ✅ DELETE ROUND
 */
export const deleteRound = async (req: AdminRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId))
      return res.status(400).json({ message: "Invalid roundId" });

    const deleted = await Round.findByIdAndDelete(roundId);

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Round not found or already deleted." });

    return res
      .status(200)
      .json({ message: "🗑️ Round deleted successfully.", deleted });
  } catch (err: any) {
    console.error("Error deleting round:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
