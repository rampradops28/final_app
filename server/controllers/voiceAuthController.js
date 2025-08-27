import { storage } from "../storage.js";

function strToEmbedding(voiceData) {
  if (!voiceData || typeof voiceData !== "string") return [0, 0, 0, 0, 0];
  // Simple deterministic pseudo-embedding from string
  const arr = Array.from(voiceData).map((c) => c.charCodeAt(0) % 32);
  const dim = 16;
  const out = new Array(dim).fill(0);
  for (let i = 0; i < arr.length; i++) out[i % dim] += arr[i];
  return out.map((v) => Math.round((v / (arr.length || 1)) * 100) / 100);
}

export const registerVoice = async (req, res) => {
  try {
    const { userId, voiceData, isActive } = req.body;
    const embedding = strToEmbedding(voiceData);
    const voicePrint = await storage.addVoicePrint({ userId, embedding, isActive: isActive ? true : false });
    res.json(voicePrint);
  } catch (error) {
    console.error("Error registering voice print:", error);
    res.status(500).json({ message: "Failed to register voice print" });
  }
};

export const verifyVoice = async (req, res) => {
  try {
    const { userId, voiceData } = req.body;
    const verified = await storage.verifyVoicePrint(userId, voiceData);
    res.json({ verified });
  } catch (error) {
    console.error("Error verifying voice:", error);
    res.status(500).json({ message: "Failed to verify voice" });
  }
};
