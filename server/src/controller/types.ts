import { Request } from "express";

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: {
    id: string; // MongoDB _id of the user
    role?: string; // optional role
  };
}
