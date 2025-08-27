import { storage } from "../storage.js";
import { isTwilioConfigured, sendSms } from "../services/smsService.js";

export const getBill = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const bill = await storage.getBill(userId, sessionId);
    res.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ message: "Failed to fetch bill" });
  }
};

export const upsertBill = async (req, res) => {
  try {
    const bill = await storage.createOrUpdateBill(req.body);

    // Fire-and-forget SMS notification if configured and phone present
    const phone = bill.customerPhone || req.body.customerPhone;
    if (phone && isTwilioConfigured()) {
      const amount = bill.totalAmount ?? req.body.totalAmount;
      const session = bill.sessionId;
      const msg = `Your bill (${session}) total is ${amount}. Thank you!`;
      sendSms({ to: phone, body: msg }).catch((e) => {
        console.error("SMS send failed:", { message: e.message, code: e.code });
      });
    }

    res.json(bill);
  } catch (error) {
    console.error("Error creating/updating bill:", error);
    res.status(500).json({ message: "Failed to create/update bill" });
  }
};
