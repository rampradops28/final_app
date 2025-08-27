import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const BillItemModel = mongoose.models.BillItem || mongoose.model("BillItem", billItemSchema);
