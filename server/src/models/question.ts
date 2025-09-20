// models/Question.ts
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }], // multiple-choice options
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 0 },
   category: { 
    type: String, 
    enum: ["Physics", "Maths", "Chemistry", "Biology", "Zoology", "Botany"], 
    required: true 
  },
  media: {
    type: {
      type: String, // "image" | "video" | "file"
      enum: ["image", "video", "file", null],
      default: null,
    },
    url: { type: String, default: null }, // path to uploaded file
  }
});

export default mongoose.model("Question", questionSchema);
