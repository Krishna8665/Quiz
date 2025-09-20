import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import quizRoutes from "./routes/quiz";
import playerRoutes from "./routes/player";
import path from "path";
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/player", playerRoutes);

export default app;
