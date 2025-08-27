import mongoose from "mongoose";

const learningContentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    language: { type: String, default: "en" },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const LearningContentModel = mongoose.models.LearningContent || mongoose.model("LearningContent", learningContentSchema);
