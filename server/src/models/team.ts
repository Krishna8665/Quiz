import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  points: number;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 0 },
});

export default mongoose.model<ITeam>("Team", TeamSchema);
