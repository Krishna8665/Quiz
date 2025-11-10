import { Request, Response } from "express";
import mongoose from "mongoose";
import QuizHistory from "../models/quizHistory";

interface QuizHistoryRequest extends Request {
  params: {
    quizId: string;
  };
}

export const getQuizHistory = async (req: QuizHistoryRequest, res: Response) => {
  try {
    const { quizId } = req.params;

    // Validate quizId
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quizId" });
    }

    // Fetch quiz history
    const history = await QuizHistory.findOne({ quizId }).populate({
      path: "rounds.roundId",
      select: "name category rules",
    });

    if (!history) {
      return res.status(404).json({ message: "Quiz history not found" });
    }

    return res.status(200).json({ history });
  } catch (err: any) {
    console.error("GetQuizHistory Error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
