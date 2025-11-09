import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubmit extends Document {
  quizId: mongoose.Types.ObjectId;
  roundId: mongoose.Types.ObjectId;
  roundNumber: number;
  teamId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubmitSchema = new Schema<ISubmit>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    roundId: { type: Schema.Types.ObjectId, ref: "Round", required: true },
    roundNumber: { type: Number, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, required: true },
  },
  { timestamps: true }
);

const Submit =
  (mongoose.models.Submit as Model<ISubmit>) ||
  mongoose.model<ISubmit>("Submit", SubmitSchema);

export default Submit;
