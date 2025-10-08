import { Router, Request, Response, NextFunction } from "express";
import {
  createQuiz,
  createQuestion,
  getQuizzes,
  getQuestions,
} from "../controller/quizController";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// -----------------------------
// Extend Express Request
// -----------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
  file?: Express.Multer.File & {
    path?: string;
    filename?: string;
    public_id?: string;
  };
}

// -----------------------------
// Router
// -----------------------------
const router = Router();

// -----------------------------
// Cloudinary Storage Engine
// -----------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const folder = "Quiz/questions";
    const resource_type = file.mimetype.startsWith("video")
      ? "video"
      : file.mimetype.startsWith("image")
      ? "image"
      : "raw";

    return {
      folder,
      resource_type,
      format: file.mimetype.split("/")[1],
      public_id: `question-${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

// -----------------------------
// Admin routes
// -----------------------------

// Create Question
router.post(
  "/create-question",
  authMiddleware(["admin"]),
  upload.single("media"), // multer will add req.file
  async (req, res, next) => {
    console.log(process.env.CLOUDINARY_API_SECRET);
    try {
      // Cast to AuthenticatedRequest after multer runs
      const authReq = req as AuthenticatedRequest;
      await createQuestion(authReq, res);
    } catch (err) {
      next(err);
    }
  }
);

// Create Quiz
router.post(
  "/create-quiz",
  authMiddleware(["admin"]),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      await createQuiz(authReq, res);
    } catch (err) {
      next(err);
    }
  }
);

// -----------------------------
// Public routes
// -----------------------------

router.get("/all", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    await getQuizzes(authReq, res);
  } catch (err) {
    next(err);
  }
});

router.get("/get-questions", authMiddleware(["admin"]), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    await getQuestions(authReq, res);
  } catch (err) {
    next(err);
  }
});

export default router;
