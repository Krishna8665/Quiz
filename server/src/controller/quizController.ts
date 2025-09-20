// controllers/quizController.ts
import { Request, Response } from "express";
import Quiz from "../models/quiz";
import Question from "../models/question";

// Create Question with optional media

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { text, options, correctAnswer, points, category, media } = req.body;

    // If file is uploaded, override media
    let finalMedia = media || null;
    if (req.file) {
      finalMedia = {
        type: req.file.mimetype.startsWith("image")
          ? "image"
          : req.file.mimetype.startsWith("video")
          ? "video"
          : "file",
        url: `/uploads/${req.file.filename}`,
      };
    }

    const question = new Question({
      text,
      options,
      correctAnswer,
      points,
      category,
      media: finalMedia,
    });

    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Error creating question", error: err });
  }
};



// Create Quiz with rounds
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, rounds } = req.body;
    // rounds = [{ name: "Round 1", questions: [questionId1, questionId2] }]

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

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.find().lean();

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
