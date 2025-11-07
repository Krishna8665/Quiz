import { Request, Response } from "express";
import Quiz from "../models/createQuiz";
import Round, { PassCondition } from "../models/createRounds";
import Question from "../models/question";
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
  timeLimitType: "perRound" | "perQuestion";
  timeLimitValue: number;
  points?: number;
  rules?: {
    enablePass?: boolean;
    passLimit?: number;
    enableNegative?: boolean;
    negativePoints?: number;
    firstHandQuestions?: number;
    firstHandPoints?: number;
    passedPoints?: number;
    passCondition?: PassCondition;
    firstHandTime?: number;
    passedTime?: number;
  };
  regulation?: {
    description?: string;
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
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { name, rounds, teams } = req.body as QuizInput;
    if (!name?.trim()) return res.status(400).json({ message: "Quiz name is required" });
    if (!rounds?.length) return res.status(400).json({ message: "At least one round is required" });
    if (!teams?.length) return res.status(400).json({ message: "At least one team is required" });

    // Validate unique team names
    const teamNames = teams.map((t) => t.name.trim().toLowerCase());
    if (new Set(teamNames).size !== teamNames.length) {
      return res.status(400).json({ message: "Team names must be unique within this quiz" });
    }

    // Step 1: Create teams
    const createdTeams = await Team.insertMany(
      teams.map((t) => ({
        name: t.name,
        points: 0,
        adminId,
      }))
    );

    // Step 2: Create rounds (with full validation)
    const usedQuestionIds: string[] = [];
    const createdRounds = [];

    for (const [index, r] of rounds.entries()) {
      if (!r.name?.trim()) return res.status(400).json({ message: `Round ${index + 1}: Name is required` });
      if (!r.category) return res.status(400).json({ message: `Round ${index + 1}: Category is required` });
      if (!r.timeLimitType) return res.status(400).json({ message: `Round ${index + 1}: Time limit type required` });
      if (!r.timeLimitValue) return res.status(400).json({ message: `Round ${index + 1}: Time limit value required` });

      // Prevent reused questions
      if (r.questions?.some((qId) => usedQuestionIds.includes(qId))) {
        return res.status(400).json({ message: "A question is being reused across rounds" });
      }
      if (r.questions) usedQuestionIds.push(...r.questions);

      // Default rule setup
      const rules = {
        enablePass: r.rules?.enablePass ?? false,
        passLimit: r.rules?.passLimit ?? 0,
        enableNegative: r.rules?.enableNegative ?? false,
        negativePoints: r.rules?.negativePoints ?? 0,
        firstHandQuestions: r.rules?.firstHandQuestions ?? 0,
        firstHandPoints: r.rules?.firstHandPoints ?? 0,
        passedPoints: r.rules?.passedPoints ?? 0,
        passCondition: r.rules?.passCondition ?? "noPass",
        firstHandTime: r.rules?.firstHandTime ?? 0,
        passedTime: r.rules?.passedTime ?? 0,
      };

      // --- Validation Logic for Rules ---
      if (rules.enableNegative && (!rules.negativePoints || rules.negativePoints <= 0)) {
        return res.status(400).json({ message: `Round ${index + 1}: Negative points must be greater than 0 when negative is enabled.` });
      }

      if (rules.enablePass) {
        if (!rules.passCondition)
          return res.status(400).json({ message: `Round ${index + 1}: Pass condition must be selected when passing is enabled.` });

        if (rules.passCondition === "onceToNextTeam") {
          if (!rules.passedPoints || rules.passedPoints <= 0)
            return res.status(400).json({ message: `Round ${index + 1}: Passed points must be provided for once-to-next-team passes.` });

          if (!rules.passedTime || rules.passedTime <= 0)
            return res.status(400).json({ message: `Round ${index + 1}: Passed time must be provided for once-to-next-team passes.` });
        }
      }

      // Create round
      const round = await Round.create({
        roundNumber: index + 1,
        name: r.name,
        category: r.category,
        timeLimitType: r.timeLimitType,
        timeLimitValue: r.timeLimitValue,
        points: r.points || 0,
        adminId,
        rules,
        regulation: {
          description: r.regulation?.description || "",
        },
        questions: r.questions || [],
      });

      // Mark questions with round ID
      if (r.questions?.length) {
        await Question.updateMany(
          { _id: { $in: r.questions } },
          { $set: { roundId: round._id } }
        );
      }

      createdRounds.push(round);
    }

    // Step 3: Create quiz referencing rounds & teams
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
    res.status(500).json({ message: "Internal server error", error: error.message });
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

    if (!quizzes.length) {
      return res.status(200).json({ message: "No quizzes found", quizzes: [] });
    }

    return res.status(200).json({
      message: "Quizzes fetched successfully",
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
