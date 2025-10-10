// models/Round.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRound extends Document {
  name: string;
  timeLimitType: "perRound" | "perQuestion"; // 🆕 add this
  timeLimitValue: number;
  // description?: string;
  rules: {
    enablePass: boolean;
    enableNegative: boolean;
  };
  adminId: mongoose.Types.ObjectId;
}

const roundSchema = new Schema<IRound>(
  {
    name: { type: String, required: true, unique: true },
    timeLimitType: {
      type: String,
      enum: ["perRound", "perQuestion"],
      default: "perQuestion",
    },
    timeLimitValue: { type: Number, required: true },
    //description: { type: String },
    rules: {
      enablePass: { type: Boolean, default: false },
      enableNegative: { type: Boolean, default: false },
    },
    adminId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRound>("Round", roundSchema);
