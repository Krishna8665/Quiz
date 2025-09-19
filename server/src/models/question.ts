import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }], // ["A", "B", "C", "D"] or empty if subjective
  correctAnswer: { type: String }, // "A" / "B" / "C" / "D" OR text
  roundType: { type: String, required: true }, // e.g., "General", "Rapid Fire"
  points: { type: Number, default: 5 },
  timeLimit: { type: Number, default: 60 },
});

export default mongoose.model("Question", questionSchema);
