// models/Quiz.ts
import mongoose, { Document, Schema } from "mongoose";

interface IMedia {
  type: "image" | "video" | "file" | null;
  url: string | null;
}

interface IRound {
  roundName: string;
  rules?: string;
  questions: mongoose.Types.ObjectId[];
  media?: IMedia; // round-level media
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  rounds: IRound[];
  isActive: boolean;
  media?: IMedia; // quiz-level media
}

const mediaSchema = new Schema<IMedia>(
  {
    type: {
      type: String,
      enum: ["image", "video", "file", null],
      default: null,
    },
    url: {
      type: String,
      default: null, // path to uploaded file
    },
  },
  { _id: false } // no extra _id for subdocs
);

const roundSchema = new Schema<IRound>({
  roundName: { type: String, required: true }, // e.g. "General Round", "Rapid Fire"
  rules: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  media: mediaSchema, // allow attaching an image/video/file to the round
});

const quizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  rounds: [roundSchema],
  isActive: { type: Boolean, default: false },
  media: mediaSchema, // allow attaching image/video/file to entire quiz
});

export default mongoose.model<IQuiz>("Quiz", quizSchema);
