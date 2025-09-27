// models/Question.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  category:
    | "Physics"
    | "Maths"
    | "Chemistry"
    | "Biology"
    | "Zoology"
    | "Botany";
  media?: {
    type: "image" | "video" | "file" | null;
    url: string | null;
  };
  adminId: mongoose.Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: [{ type: String }], // multiple-choice 
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["Physics", "Maths", "Chemistry", "Biology", "Zoology", "Botany"],
      required: true,
    },
    media: {
      type: {
        type: String,
        enum: ["image", "video", "file", null],
        default: null,
      },
      url: { type: String, default: null },
    },
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
