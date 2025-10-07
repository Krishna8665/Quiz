import express from "express";
import { register, login } from "../controller/authController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

//  normal self-registration (anyone can register as user)
router.post("/register", register);

//  admin-only registration (sets createdBy = adminId)
router.post("/admin/register", authMiddleware(["admin"]), register);

//  login
router.post("/login", login);



export default router;
