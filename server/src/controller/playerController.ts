import { Request, Response } from "express";
import Quiz from "../models/quiz";
import Question from "../models/question";
import User from "../models/User";

export const getActiveQuiz = async (req: Request, res: Response) => {
  const quiz = await Quiz.findOne({ isActive: true }).populate("rounds.questions");
  res.json(quiz);
};

export const submitAnswer = async (req: Request, res: Response) => {
  const { userId, questionId, answer } = req.body;

  const user: any = await User.findById(userId);
  const question: any = await Question.findById(questionId);

  if (!user || !question) return res.status(404).json({ message: "Invalid request" });

  if (answer === question.correctAnswer) {
    user.score += question.points;
    await user.save();
    return res.json({ correct: true, newScore: user.score });
  }

  res.json({ correct: false, newScore: user.score });
};
