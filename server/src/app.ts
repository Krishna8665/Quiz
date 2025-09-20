import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import quizRoutes from "./routes/quiz";
import playerRoutes from "./routes/player";
import teamRoutes from "./routes/team";
import path from "path";
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(cors({
  origin: "http://localhost:5173", // or "http://localhost:3000"
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/team", teamRoutes);

export default app;
