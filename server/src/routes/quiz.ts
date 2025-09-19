import express from "express";
import { createQuestion, createQuiz, getQuizzes } from "../controller/quizController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/question", authMiddleware, adminMiddleware, createQuestion);
router.post("/", authMiddleware, adminMiddleware, createQuiz);
router.get("/", getQuizzes);

export default router;
