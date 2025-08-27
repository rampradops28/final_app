import mongoose from "mongoose";

const voiceCommandSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    command: { type: String, required: true },
    intent: { type: String },
    success: { type: Boolean, default: true },
    meta: { type: Object },
  },
  { timestamps: true }
);

export const VoiceCommandModel = mongoose.models.VoiceCommand || mongoose.model("VoiceCommand", voiceCommandSchema);
