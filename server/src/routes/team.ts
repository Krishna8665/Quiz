import { Router } from "express";
import {
  addTeam,
  getTeams,
  deleteTeam,
  addPoints,
  reducePoints,
} from "../controller/teamController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/teams", authMiddleware(["admin"]), addTeam); // add team
router.get("/teams", getTeams); // fetch all teams
router.delete("/teams/:id", authMiddleware(["admin"]), deleteTeam);
router.patch("/teams/:id/add", authMiddleware(["admin"]), addPoints);
router.patch("/teams/:id/reduce", authMiddleware(["admin"]), reducePoints);

export default router;
