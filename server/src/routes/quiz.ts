import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createQuiz } from "../controller/createQuizController";
const router = Router();

router.post("/create-quiz", authMiddleware(["admin"]), createQuiz); 


export default router;
