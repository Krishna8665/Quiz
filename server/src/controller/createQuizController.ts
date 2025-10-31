import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Quiz from "../models/createQuiz";
import Round from "../models/createRounds";
import Question from "../models/question";
import Team from "../models/team";
import { AuthRequest } from "./types";

interface RoundInput {
  name: string;
  category?: string;
  timeLimitType?: string;
  timeLimitValue: number;
  points?: number;
  rules?: {
    enablePass?: boolean;
    enableNegative?: boolean;
  };
  questions?: string[];
}

interface QuizInput {
  name: string;
  rounds: RoundInput[];
  teams: { name: string }[];
}

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, rounds, teams } = req.body as QuizInput;

    if (!name || !rounds?.length || !teams?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Step 1: Create teams with default points 0
    const createdTeams = await Team.insertMany(
      teams.map((t) => ({
        name: t.name,
        points: 0, // default points for teams
        adminId,
      }))
    );

    // ✅ Step 2: Create rounds and ensure no reused questions
    const usedQuestionIds: string[] = [];
    const createdRounds = [];

    for (const r of rounds) {
      const duplicate = r.questions?.some((qId: string) =>
        usedQuestionIds.includes(qId)
      );
      if (duplicate) {
        return res
          .status(400)
          .json({ message: "A question is being reused across rounds." });
      }

      if (r.questions) usedQuestionIds.push(...r.questions);

      const round = await Round.create({
        name: r.name,
        category: r.category,
        timeLimitType: r.timeLimitType,
        timeLimitValue: r.timeLimitValue,
        points: r.points || 0, // points for round scoring
        adminId,
        rules: {
          enablePass: r.rules?.enablePass ?? false,
          enableNegative: r.rules?.enableNegative ?? false,
        },
        questions: r.questions || [],
      });

      // Mark those questions as used in that round
      if (r.questions?.length) {
        await Question.updateMany(
          { _id: { $in: r.questions } },
          { $set: { roundId: round._id } }
        );
      }

      createdRounds.push(round);
    }

    // ✅ Step 3: Create quiz referencing both rounds and teams
    const quiz = await Quiz.create({
      name,
      adminId,
      rounds: createdRounds.map((r) => r._id),
      teams: createdTeams.map((t) => t._id),
      numTeams: createdTeams.length,
    });

    res.status(201).json({
      message: "✅ Quiz created successfully",
      quiz,
    });
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id || req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find all quizzes created by the admin and populate related data
    const quiz = await Quiz.find({ adminId })
      .populate("rounds")
      .populate("teams");

    if (!quiz.length) {
      return res.status(200).json({ message: "No quiz found", quiz: [] });
    }

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quiz,
    });
  } catch (error: any) {
    console.error("Error fetching quiz:", error.message);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};


export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id || req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const quiz = await Quiz.findOne({ _id: id, adminId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Delete related rounds first (optional but cleaner)
    await Round.deleteMany({ _id: { $in: quiz.rounds } });

    // Delete the quiz
    await Quiz.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Quiz and related rounds deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting quiz:", error.message);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};
