import mongoose, { Schema, Document, Types } from "mongoose";

interface IOption {
  text: string;
}

export interface IQuestion extends Document {
  text: string;
  options: IOption[]; // ✅ FIXED: subdocuments, not string[]
  correctAnswer: string; // stores _id of the correct option
  points: number;
  category:
    | "Physics"
    | "Maths"
    | "Chemistry"
    | "Biology"
    | "Zoology"
    | "Botany";
  roundId?: Types.ObjectId;
  quizId?: Types.ObjectId;
  media?: {
    type: "image" | "video" | "file" | null;
    url: string | null;
    publicId?: string | null;
    resourceType?: string | null;
  };
  adminId: mongoose.Types.ObjectId;
}

const OptionSchema = new Schema<IOption>({
  text: { type: String, required: true },
});

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: { type: [OptionSchema], required: true }, // ✅ FIXED
    correctAnswer: { type: String, required: true }, // stores option._id as string
    points: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["Physics", "Maths", "Chemistry", "Biology", "Zoology", "Botany"],
      required: true,
    },
    roundId: { type: Schema.Types.ObjectId, ref: "Round" },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
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
