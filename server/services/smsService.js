import twilio from "twilio";

export function isTwilioConfigured() {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!(process.env.TWILIO_FROM || process.env.TWILIO_FROM_NUMBER)
  );
}

export async function sendSms({ to, body }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM || process.env.TWILIO_FROM_NUMBER;
  const client = twilio(accountSid, authToken);
  const res = await client.messages.create({ to, from, body });
  return res;
}
