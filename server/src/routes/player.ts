import express from "express";
import { getActiveQuiz } from "../controller/playerController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/active-quiz", getActiveQuiz);
//router.post("/submit", authMiddleware, submitAnswer);

export default router;
