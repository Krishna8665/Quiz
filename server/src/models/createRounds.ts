// models/Round.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRound extends Document {
  name: string;
  timePerQuestion: number;
  // description?: string;
  adminId: mongoose.Types.ObjectId;
}

const roundSchema = new Schema<IRound>(
  {
    name: { type: String, required: true, unique: true },
    timePerQuestion: { type: Number, required: true, default: 30 },
    //description: { type: String },
    adminId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRound>("Round", roundSchema);
