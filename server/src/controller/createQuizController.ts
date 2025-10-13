import { Request, Response } from "express";
import Quiz from "../models/createQuiz";
import Round from "../models/createRounds";
import { AuthRequest } from "./types";

interface RoundInput {
  name: string;
  category?: string;
  timeLimitType?: string;
  timeLimitValue: number;
  rules?: {
    enablePass?: boolean;
    enableNegative?: boolean;
  };
}

interface QuizInput {
  name: string;
  rounds: RoundInput[];
  teams: string[]; // team IDs
  numTeams: number;
}

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id || req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //Ensure body is parsed
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid or missing JSON body" });
    }

    const { name, rounds, teams, numTeams } = req.body as QuizInput;

    if (!name || !rounds?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //Create rounds first
    const createdRounds = await Round.insertMany(
      rounds.map((r) => ({
        name: r.name,
        category: r.category,
        timeLimitType: r.timeLimitType,
        timeLimitValue: r.timeLimitValue,
        adminId,
        rules: {
          enablePass: r.rules?.enablePass ?? false,
          enableNegative: r.rules?.enableNegative ?? false,
        },
      }))
    );

    // create quiz
    const quiz = await Quiz.create({
      name,
      adminId,
      rounds: createdRounds.map((r) => r._id),
      teams, // team IDs from frontend
      numTeams,
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error: any) {
    console.error("Error creating quiz:", error.message, error.stack);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
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
