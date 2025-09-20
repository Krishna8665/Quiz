// controllers/quizController.ts
import { Request, Response } from "express";
import Quiz from "../models/quiz";
import Question from "../models/question";

// Create Question with optional media
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { text, options, correctAnswer, points } = req.body;

    const media = req.file
      ? {
          type: req.file.mimetype.startsWith("image")
            ? "image"
            : req.file.mimetype.startsWith("video")
            ? "video"
            : "file",
          url: `/uploads/${req.file.filename}`,
        }
      : null;

    const question = new Question({
      text,
      options,
      correctAnswer,
      points,
      media,
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
  const quizzes = await Quiz.find().populate("rounds.questions");
  res.json(quizzes);
};
