
// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (roles: string[] = []) => {
  return (req: any, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

      // import jwt from "jsonwebtoken";
      // import { Request, Response, NextFunction } from "express";
      
      // export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
      //   const token = req.headers["authorization"]?.split(" ")[1];
      //   if (!token) return res.status(401).json({ message: "No token" });
      
      //   try {
      //     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      //     req.user = decoded;
      //     next();
      //   } catch {
      //     res.status(401).json({ message: "Invalid token" });
      //   }
      // };
      
      // export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
      //   if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      //   next();
      // };