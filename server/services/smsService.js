import twilio from "twilio";

export function isTwilioConfigured() {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!(process.env.TWILIO_FROM || process.env.TWILIO_FROM_NUMBER)
  );
}

export async function sendSms({ to, body, mediaUrl }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM || process.env.TWILIO_FROM_NUMBER;
  const client = twilio(accountSid, authToken);
  const payload = { to, from, body };
  if (mediaUrl) payload.mediaUrl = mediaUrl;
  const res = await client.messages.create(payload);
  return res;
}
