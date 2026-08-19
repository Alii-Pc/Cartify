import mongoose from "mongoose";

const aiChatLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    sender: { type: String, enum: ["user", "model"], required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const AIChatLog = (mongoose.models.AIChatLog || mongoose.model("AIChatLog", aiChatLogSchema)) as any;
