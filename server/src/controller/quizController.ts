import { Request, Response } from "express";
import Quiz from "../models/quiz";
import Question from "../models/question";

// 👇 Define a local type for this file
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export const createQuestion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    const file = req.file;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminId = user.id;
    const { text, options, correctAnswer, points, category, media } = req.body;

    let finalMedia = media || null;
    if (file) {
      finalMedia = {
        type: file.mimetype.startsWith("image")
          ? "image"
          : file.mimetype.startsWith("vid")
          ? "video"
          : "unknown",
        url: `/uploads/${file.filename}`,
      };
    }

    const question = new Question({
      text,
      options,
      correctAnswer,
      points,
      category,
      media: finalMedia,
      adminId,
    });

    await question.save();
    return res.json(question);
  } catch (err) {
    console.error("Error creating question:", err);
    return res.status(500).json({
      message: "Error creating question",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

// Create Quiz with rounds
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, rounds } = req.body;
    const quiz = new Quiz({ title, rounds });
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz", error: err });
  }
};

// Get all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find().populate("rounds.questions");

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: "No quizzes found" });
    }

    return res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const questions = await Question.find({ adminId }).lean();

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching questions",
      error: (error as Error).message,
    });
  }
};
