import { Router } from "express";
import {
  addTeam,
  getTeams,
  deleteTeam,
  addPoints,
  reducePoints,
} from "../controller/teamController";
import { authMiddleware } from "../middleware/auth";
import {
  createRound,
  deleteRound,
  getRounds,
} from "../controller/roundController";

const router = Router();

router.post("/create-rounds", authMiddleware(["admin"]), createRound); // add team
router.get("/get-rounds", authMiddleware(["admin"]), getRounds); // add team
router.delete("/del-rounds/:id", authMiddleware(["admin"]), deleteRound); // add team

export default router;
