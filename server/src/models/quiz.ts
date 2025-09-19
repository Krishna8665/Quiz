import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundName: { type: String, required: true }, // "General Round", "Rapid Fire", etc.
  rules: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  rounds: [roundSchema],
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", quizSchema);
