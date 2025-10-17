import { Request, Response } from "express";
import Question from "../models/question";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role?: string; email?: string };
  file?: Express.Multer.File & {
    path?: string;
    filename?: string;
    public_id?: string;
  };
}

export const createQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { text, options, correctAnswer, points, category } = req.body;

    if (!text || !options?.length || !correctAnswer || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 1️⃣: Generate unique IDs for options before saving
    const optionsWithIds = options.map((opt: any) => ({
      _id: new (require("mongoose")).Types.ObjectId(),
      text: opt.text,
    }));

    // Step 2️⃣: Find correct option by text (case insensitive)
    const correctOption = optionsWithIds.find(
      (opt:any) =>
        opt.text.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    );

    if (!correctOption) {
      return res
        .status(400)
        .json({ message: "Correct answer must match one of the options" });
    }

    // Step 3️⃣: Create the question safely
    const question = new Question({
      text,
      options: optionsWithIds,
      correctAnswer: correctOption._id.toString(),
      points,
      category,
      adminId: user.id,
    });

    await question.save();
    return res.status(201).json({ success: true, question });
  } catch (err) {
    console.error("Error creating question:", err);
    return res.status(500).json({
      message: "Error creating question",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

// // Create Quiz with rounds
// export const createQuiz = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const user = req.user;
//     if (!user) return res.status(401).json({ message: "Unauthorized" });

//     const { title, rounds } = req.body;

//     const quiz = new Quiz({
//       title,
//       rounds,
//       adminId: user.id,
//     });

//     await quiz.save();
//     return res.status(201).json(quiz);
//   } catch (err) {
//     console.error("Error creating quiz:", err);
//     return res.status(500).json({
//       message: "Error creating quiz",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };

// // Get all quizzes with populated rounds and questions
// export const getQuizzes = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const quizzes = await Quiz.find().populate({
//       path: "rounds.questions",
//       model: "Question",
//     });

//     if (!quizzes || quizzes.length === 0) {
//       return res.status(404).json({ message: "No quizzes found" });
//     }

//     return res.status(200).json(quizzes);
//   } catch (err) {
//     console.error("Error fetching quizzes:", err);
//     return res.status(500).json({
//       message: "Server error while fetching quizzes",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };

// Get questions for the current admin
export const getQuestions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const questions = await Question.find({ adminId })
      .populate("correctAnswer", "text")
      .lean();

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching questions",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
// 🟡 Update question
export const updateQuestion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;

    const updated = await Question.findOneAndUpdate(
      { _id: id, adminId },
      req.body,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ message: "Question not found or unauthorized" });

    res.status(200).json({ message: "✅ Question updated", question: updated });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔴 Delete question
export const deleteQuestion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;

    const deleted = await Question.findOneAndDelete({ _id: id, adminId });
    if (!deleted)
      return res
        .status(404)
        .json({ message: "Question not found or unauthorized" });

    res.status(200).json({ message: "✅ Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
