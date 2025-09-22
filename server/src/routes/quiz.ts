import { Router } from "express";
import {
  createQuiz,
  createQuestion,
  getQuizzes,
  getQuestions,
} from "../controller/quizController";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";

// Setup multer for file uploads if needed
const upload = multer({ dest: "uploads/" });

const router = Router();

// Admin only routes
router.post(
  "/create-question",
  authMiddleware(["admin"]),
  upload.single("media"), // optional media upload
  (req, res, next) => createQuestion(req as any, res).catch(next)
);

router.post("/create-quiz", authMiddleware(["admin"]), createQuiz);

// Public routes
router.get("/all", getQuizzes);
router.get("/questions", authMiddleware(["admin"]), (req, res, next) =>
  getQuestions(req as any, res).catch(next)
);

export default router;
