import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createQuiz,
  deleteQuiz,
  getQuiz,
} from "../controller/createQuizController";
const router = Router();

router.post("/create-quiz", authMiddleware(["admin"]), createQuiz);
router.get("/get-quiz", authMiddleware(["admin"]), getQuiz);
router.delete("/delete-quiz/:id", authMiddleware(["admin"]), deleteQuiz);

export default router;
