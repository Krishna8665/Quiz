// routes/quiz.ts
import { Router } from "express";
import {
  createQuiz,
  createQuestion,
  getQuizzes,
} from "../controller/quizController";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Admin only
router.post(
  "/create-question",
  authMiddleware(["admin"]),
  upload.single("media"),
  createQuestion
);
router.post("/create-quiz", authMiddleware(["admin"]), createQuiz);

// Public
router.get("/all", getQuizzes);

export default router;
