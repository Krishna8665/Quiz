import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAnswer {
  questionId: Types.ObjectId;
  givenAnswer: string | number;
  pointsEarned: number;
  isCorrect: boolean;
  isPassed: boolean;
}

export interface IQuizHistory extends Document {
  quizId: Types.ObjectId;
  roundId: Types.ObjectId;
  teamId: Types.ObjectId;
  answers: IAnswer[];
  totalPoints: number;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    givenAnswer: { type: Schema.Types.Mixed, required: true },
    pointsEarned: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
    isPassed: { type: Boolean, default: false },
  },
  { _id: false }
);

const quizHistorySchema = new Schema<IQuizHistory>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    roundId: { type: Schema.Types.ObjectId, ref: "Round", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    answers: { type: [answerSchema], default: [] },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Compound unique index: one history per quiz+round+team
quizHistorySchema.index({ quizId: 1, roundId: 1, teamId: 1 }, { unique: true });

export default mongoose.model<IQuizHistory>("QuizHistory", quizHistorySchema);
