import mongoose, { Schema, Document } from "mongoose";

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
  round: mongoose.Types.ObjectId; 
  media?: {
    type: "image" | "video" | "file" | null;
    url: string | null;
    publicId?: string | null;
    resourceType?: string | null;
  };
  adminId: mongoose.Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["Physics", "Maths", "Chemistry", "Biology", "Zoology", "Botany"],
      required: true,
    },
    round: {
      type: Schema.Types.ObjectId,
      ref: "Round", // Links to Round schema
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
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
