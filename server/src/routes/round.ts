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
  getRoundById,
  getRounds,
} from "../controller/roundController";

const router = Router();

router.post("/create-rounds", authMiddleware(["admin"]), createRound); 
router.get("/get-rounds", authMiddleware(["admin"]), getRounds); 
router.get("/get-roundById", authMiddleware(["admin"]), getRoundById); 
router.delete("/del-rounds/:id", authMiddleware(["admin"]), deleteRound);

export default router;
