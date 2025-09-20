import { Router } from "express";
import {
  addTeam,
  getTeams,
  deleteTeam,
  addPoints,
  reducePoints,
} from "../controller/teamController";

const router = Router();

router.post("/teams", addTeam); // add team
router.get("/teams", getTeams); // fetch all teams
router.delete("/teams/:id", deleteTeam); // delete team
router.patch("/teams/:id/add", addPoints); // increase points
router.patch("/teams/:id/reduce", reducePoints); // reduce points (negative marking)

export default router;
