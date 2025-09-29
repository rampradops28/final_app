import { isTwilioConfigured, sendSms } from "../services/smsService.js";

export const sendSMS = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ message: "phoneNumber and message are required" });
    }

    if (!isTwilioConfigured()) {
      return res.status(500).json({ message: "Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM or TWILIO_FROM_NUMBER" });
    }

    const result = await sendSms({ to: phoneNumber, body: message });

    res.json({ success: true, messageId: result.sid, sentTo: phoneNumber });
  } catch (error) {
    console.error("Error sending SMS:", { message: error.message, code: error.code, status: error.status, moreInfo: error.moreInfo });
    const status = error.status || 500;
    res.status(status).json({ message: "Failed to send SMS", error: error.message });
  }
};

export const sendInvoiceMMS = async (req, res) => {
  try {
    const { phoneNumber, fileName, fileBase64, message } = req.body;
    if (!phoneNumber || !fileName || !fileBase64) {
      return res.status(400).json({ message: "phoneNumber, fileName, fileBase64 are required" });
    }

    if (!isTwilioConfigured()) {
      return res.status(500).json({ message: "Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM or TWILIO_FROM_NUMBER" });
    }

    const commaIdx = fileBase64.indexOf(",");
    const base64Data = commaIdx >= 0 ? fileBase64.slice(commaIdx + 1) : fileBase64;
    const buffer = Buffer.from(base64Data, "base64");

    const fs = await import("fs");
    const path = await import("path");
    const invoicesDir = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(invoicesDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const protocol = (req.headers["x-forwarded-proto"] || req.protocol || "http");
    const host = req.get("host");
    const mediaUrl = `${protocol}://${host}/invoices/${encodeURIComponent(safeName)}`;

    const smsBody = message || "Your invoice is ready.";
    const result = await sendSms({ to: phoneNumber, body: smsBody, mediaUrl });
    return res.json({ success: true, messageId: result.sid, mediaUrl });
  } catch (error) {
    console.error("Error sending invoice MMS:", { message: error.message, code: error.code, status: error.status, moreInfo: error.moreInfo });
    const status = error.status || 500;
    return res.status(status).json({ message: "Failed to send invoice MMS", error: error.message });
  }
};
