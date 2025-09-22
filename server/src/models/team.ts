import mongoose, { Schema, Document, Types } from "mongoose";

// Use Types.ObjectId for adminId
export interface ITeam extends Document {
  name: string;
  points: number;
  adminId: Types.ObjectId | string; // can be populated 
}

const TeamSchema: Schema<ITeam> = new Schema(
  {
    name: { type: String, required: true,unique: true },
    points: { type: Number, default: 0 },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITeam>("Team", TeamSchema);
