import mongoose from "mongoose";

const voicePrintSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    embedding: { type: [Number], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const VoicePrintModel = mongoose.models.VoicePrint || mongoose.model("VoicePrint", voicePrintSchema);
