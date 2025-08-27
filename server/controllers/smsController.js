import twilio from "twilio";

export const sendSMS = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ message: "phoneNumber and message are required" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM;

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(500).json({ message: "Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER" });
    }

    const client = twilio(accountSid, authToken);
    const payload = {
      body: message,
      to: phoneNumber,
      from: fromNumber,
    };
    const result = await client.messages.create(payload);

    res.json({ success: true, messageId: result.sid, sentTo: phoneNumber });
  } catch (error) {
    console.error("Error sending SMS:", { message: error.message, code: error.code, status: error.status, moreInfo: error.moreInfo });
    const status = error.status || 500;
    res.status(status).json({ message: "Failed to send SMS", error: error.message });
  }
};
