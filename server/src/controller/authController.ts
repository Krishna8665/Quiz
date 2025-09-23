import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend request to include user (from authMiddleware)
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    // if logged-in admin is creating user, set createdBy
    const createdBy = req.user?.role === "admin" ? req.user.id : undefined;
    const user = new User({ name, email, password: hashed, role, createdBy });
    await user.save();

    res.status(201).json({
      message: "User registered",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err });
  }
};
