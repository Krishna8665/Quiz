import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../models/createQuiz";
import Round, { PassCondition } from "../models/createRounds";
import Team from "../models/team";
import { AuthRequest } from "./types";

interface RoundInput {
  name: string;
  category:
    | "general round"
    | "subject round"
    | "estimation round"
    | "rapid fire round"
    | "buzzer round";
  rules: {
    enableTimer: boolean;
    timerType?: "perQuestion" | "allQuestions";
    timeLimitValue?: number;
    enableNegative?: boolean;
    negativePoints?: number;
    enablePass?: boolean;
    passCondition?: PassCondition;
    passLimit?: number;
    passedPoints?: number;
    passedTime?: number;
    assignQuestionType: "forAllTeams" | "forEachTeam";
    numberOfQuestion: number;
    points: number; // points per question
  };
  regulation?: {
    description?: string;
  };
  questions: string[]; // Admin provides questions
}

interface QuizInput {
  name: string;
  rounds: RoundInput[];
  teams: { name: string }[];
}

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId)
      return res.status(401).json({ message: "Unauthorized" });

    const { name, rounds, teams } = req.body as QuizInput;
    if (!name?.trim())
      return res.status(400).json({ message: "Quiz name is required" });
    if (!rounds?.length)
      return res
        .status(400)
        .json({ message: "At least one round is required" });
    if (!teams?.length)
      return res.status(400).json({ message: "At least one team is required" });

    // Validate unique team names
    const teamNames = teams.map((t) => t.name.trim().toLowerCase());
    if (new Set(teamNames).size !== teamNames.length) {
      return res
        .status(400)
        .json({ message: "Team names must be unique within this quiz" });
    }

    // Step 1: Create teams
    const createdTeams = await Team.insertMany(
      teams.map((t) => ({
        name: t.name,
        points: 0,
        adminId,
      }))
    );

    // Step 2: Create rounds
    const createdRounds = [];
    for (const [index, r] of rounds.entries()) {
      if (!r.name?.trim())
        return res
          .status(400)
          .json({ message: `Round ${index + 1}: Name is required` });
      if (!r.category)
        return res
          .status(400)
          .json({ message: `Round ${index + 1}: Category is required` });
      if (!r.rules)
        return res
          .status(400)
          .json({ message: `Round ${index + 1}: Rules are required` });

      const rules = r.rules;

      // Validation for assignQuestionType
      if (!["forAllTeams", "forEachTeam"].includes(rules.assignQuestionType)) {
        return res
          .status(400)
          .json({ message: `Round ${index + 1}: Invalid assignQuestionType` });
      }

      if (rules.assignQuestionType === "forAllTeams" && rules.enableTimer) {
        return res.status(400).json({
          message: `Round ${index + 1}: enableTimer must be false for assignQuestionType "forAllTeams"`,
        });
      }

      if (!rules.numberOfQuestion || rules.numberOfQuestion <= 0) {
        return res
          .status(400)
          .json({
            message: `Round ${index + 1}: numberOfQuestion must be greater than 0`,
          });
      }

      if (!rules.points || rules.points <= 0) {
        return res
          .status(400)
          .json({
            message: `Round ${index + 1}: points must be greater than 0`,
          });
      }

      if (rules.enableNegative && (!rules.negativePoints || rules.negativePoints <= 0)) {
        return res
          .status(400)
          .json({ message: `Round ${index + 1}: negativePoints must be > 0` });
      }

      if (rules.enablePass) {
        if (!rules.passCondition)
          return res
            .status(400)
            .json({
              message: `Round ${index + 1}: passCondition required when enablePass is true`,
            });

        if (rules.passCondition === "onceToNextTeam") {
          if (!rules.passedPoints || rules.passedPoints <= 0)
            return res
              .status(400)
              .json({
                message: `Round ${index + 1}: passedPoints must be > 0 for onceToNextTeam`,
              });
          if (!rules.passedTime || rules.passedTime <= 0)
            return res
              .status(400)
              .json({
                message: `Round ${index + 1}: passedTime must be > 0 for onceToNextTeam`,
              });
        }
      }

      // Validate provided questions
      if (!r.questions || r.questions.length < rules.numberOfQuestion) {
        return res.status(400).json({
          message: `Round ${index + 1}: Not enough questions provided. Required ${rules.numberOfQuestion}, found ${r.questions?.length || 0}`,
        });
      }

      const selectedQuestions = r.questions.slice(0, rules.numberOfQuestion);

      // Create round
      const round = await Round.create({
        roundNumber: index + 1,
        name: r.name,
        category: r.category,
        rules,
        regulation: { description: r.regulation?.description || "" },
        questions: selectedQuestions,
        adminId,
        points: rules.points,
      });

      createdRounds.push(round);
    }

    // Step 3: Create quiz
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
      rounds: createdRounds,
      teams: createdTeams,
    });
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Get all quizzes created by the logged-in admin
 */
export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const quizzes = await Quiz.find({ adminId })
      .populate("rounds")
      .populate("teams")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: quizzes.length ? "Quizzes fetched successfully" : "No quizzes found",
      quizzes,
    });
  } catch (error: any) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      message: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};

/**
 * Delete a quiz and all related rounds & teams
 */
export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // quiz ID
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const quiz = await Quiz.findOne({ _id: id, adminId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Delete related rounds
    await Round.deleteMany({ _id: { $in: quiz.rounds } });

    // Delete related teams
    await Team.deleteMany({ _id: { $in: quiz.teams } });

    // Delete the quiz itself
    await Quiz.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Quiz and related rounds/teams deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return res.status(500).json({
      message: "Failed to delete quiz",
      error: error.message,
    });
  }
};
