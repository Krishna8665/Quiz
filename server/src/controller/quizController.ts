import { Request, Response } from "express";
import Quiz from "../models/quiz";
import Question from "../models/question";

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Error creating question", error: err });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz", error: err });
  }
};

export const getQuizzes = async (req: Request, res: Response) => {
  const quizzes = await Quiz.find().populate("rounds.questions");
  res.json(quizzes);
};
