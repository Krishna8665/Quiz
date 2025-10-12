import mongoose, { Schema, Document } from "mongoose";
import { IRound } from "./createRounds";

export interface IQuiz extends Document {
  name: string;
  adminId: mongoose.Types.ObjectId;
  //rounds: IRound[];
  rounds: mongoose.Types.ObjectId[];
  teams: mongoose.Types.ObjectId[];
  numTeams: number;
  //teams: mongoose.Types.ObjectId[]; // array of team IDs
  //questions: mongoose.Types.ObjectId[]; // optional, can be per round later
}

const quizSchema = new Schema<IQuiz>(
  {
    name: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    rounds: [{ type: Schema.Types.ObjectId, ref: "Round", required: true }],
    teams: [{ type: Schema.Types.ObjectId, ref: "Team", required: true }],
    numTeams: { type: Number, default: 1 },
    //teams: [{ type: Schema.Types.ObjectId, ref: "Team", required: true }],
    //questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>("Quiz", quizSchema);
