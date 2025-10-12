// models/createRounds.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRound extends Document {
  name: string;
  category: string;
  timeLimitType: "perRound" | "perQuestion";
  timeLimitValue: number;
  rules: {
    enablePass: boolean;
    enableNegative: boolean;
  };
  adminId: mongoose.Types.ObjectId;
}

const roundSchema = new Schema<IRound>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    timeLimitType: {
      type: String,
      enum: ["perRound", "perQuestion"],
      required: true,
    },
    timeLimitValue: { type: Number, required: true },
    rules: {
      enablePass: { type: Boolean, default: false },
      enableNegative: { type: Boolean, default: false },
    },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRound>("Round", roundSchema);
