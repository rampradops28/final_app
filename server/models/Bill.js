import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    totalAmount: { type: Number, default: 0 },
    customerPhone: { type: String, default: null },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export const BillModel = mongoose.models.Bill || mongoose.model("Bill", billSchema);
