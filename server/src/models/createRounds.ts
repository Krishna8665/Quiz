import mongoose, { Schema, Document, Types } from "mongoose";

export type PassCondition = "noPass" | "onceToNextTeam" | "wrongIfPassed";

export interface IRoundRules {
  enablePass: boolean;
  passLimit: number; // how many times a question can be passed
  enableNegative: boolean;
  negativePoints: number; // points to deduct if wrong
  firstHandQuestions: number; // how many first-hand questions per team
  firstHandPoints: number; // points for correct first-hand answer
  passedPoints: number; // points for correct passed answer
  passCondition: PassCondition; // "noPass" | "onceToNextTeam" | "wrongIfPassed"
  passedTime?: number; // time allowed for passed question if applicable
  firstHandTime?: number; // time allowed per first-hand question
}

export interface IRound extends Document {
  roundNumber: number;
  name: string;
  category:
    | "general round"
    | "subject round"
    | "estimation round"
    | "rapid fire round"
    | "buzzer round";
  timeLimitType: "perRound" | "perQuestion";
  timeLimitValue: number; // total round time or per question time
  points: number;
  rules: IRoundRules;
  regulation: {
    description: string;
  };
  questions: Types.ObjectId[];
  adminId: Types.ObjectId | string;
}

const RoundSchema = new Schema<IRound>(
  {
    roundNumber: { type: Number, required: true },

    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "general round",
        "subject round",
        "estimation round",
        "rapid fire round",
        "buzzer round",
      ],
      required: true,
    },
    timeLimitType: {
      type: String,
      enum: ["perRound", "perQuestion"],
      required: true,
    },
    timeLimitValue: { type: Number, required: true },
    points: { type: Number, default: 0 },

    rules: {
      enablePass: { type: Boolean, default: false },
      passLimit: { type: Number, default: 0 },
      enableNegative: { type: Boolean, default: false },
      negativePoints: { type: Number, default: 0 },
      firstHandQuestions: { type: Number, default: 0 },
      firstHandPoints: { type: Number, default: 0 },
      passedPoints: { type: Number, default: 0 },
      passCondition: {
        type: String,
        enum: ["noPass", "onceToNextTeam", "wrongIfPassed"],
        default: "noPass",
      },
      passedTime: { type: Number, default: 0 },
      firstHandTime: { type: Number, default: 0 },
    },

    regulation: {
      description: { type: String, default: "" },
    },

    questions: [{ type: Schema.Types.ObjectId, ref: "Question", default: [] }],

    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Optional: Add index for faster queries (filter by admin or category)
RoundSchema.index({ adminId: 1 });
RoundSchema.index({ category: 1 });

export default mongoose.model<IRound>("Round", RoundSchema);
