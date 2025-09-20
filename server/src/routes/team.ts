import { Router } from "express";
import {
  addTeam,
  getTeams,
  deleteTeam,
  updatePoints,
} from "../controller/teamController";

const router = Router();

router.post("/teams", addTeam);
router.get("/teams", getTeams);
router.delete("/teams/:id", deleteTeam);
router.put("/teams/:id/points", updatePoints);

export default router;
