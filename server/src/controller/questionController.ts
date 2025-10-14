import { Request, Response } from "express";
import Question from "../models/question";
import Quiz from "../models/createRounds"; // Make sure you have a Quiz model

interface AuthenticatedRequest extends Request {
  user?: { id: string; role?: string; email?: string };
  file?: Express.Multer.File & {
    path?: string;
    filename?: string;
    public_id?: string;
  };
}

// Create a new question
export const createQuestion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { text, options, correctAnswer, points, category } = req.body;
    if (!text || !options?.length || !correctAnswer || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let finalMedia = null;
    if (req.file) {
      const file = req.file as any;
      finalMedia = {
        type: file.resource_type || "file",
        url: file.path || file.secure_url,
        publicId: file.filename || file.public_id,
        resourceType: file.resource_type || "raw",
      };
    }

    const question = new Question({
      text,
      options,
      correctAnswer,
      points,
      category,
      media: finalMedia,
      adminId: user.id,
    });

    await question.save();
    return res.status(201).json(question);
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

    const questions = await Question.find({ adminId }).lean();

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
