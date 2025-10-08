import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import quizRoutes from "./routes/quiz";
import playerRoutes from "./routes/player";
import teamRoutes from "./routes/team";
import rounds from "./routes/rounds";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  cors({
    origin: "http://localhost:5173", // or "http://localhost:3000"
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/round", rounds);


// test route in app.ts (temporarily)
app.get("/api/test-cloudinary", (req, res) => {
  res.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_KEY,
  });
});

export default app;
