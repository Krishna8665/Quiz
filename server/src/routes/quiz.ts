import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createQuiz,
  deleteQuiz,
  getAllQuiz,
  getQuizById,
  getQuizzesForUser,
} from "../controller/createQuizController";
const router = Router();

router.post("/create-quiz", authMiddleware(["admin"]), createQuiz);
router.get("/get-allquiz", authMiddleware(["admin"]), getAllQuiz);
router.get("/get-quiz/:quizId", authMiddleware(["admin", "User"]), getQuizById);
router.get("/get-quizForUser", authMiddleware(), getQuizzesForUser);
router.delete("/delete-quiz/:id", authMiddleware(["admin"]), deleteQuiz);

export default router;
