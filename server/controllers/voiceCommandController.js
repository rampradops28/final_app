import { storage } from "../storage.js";

export const addVoiceCommand = async (req, res) => {
  try {
    const { userId, command, action, success } = req.body;
    const payload = { userId, command, intent: action, success };
    const saved = await storage.addVoiceCommand(payload);
    res.json(saved);
  } catch (error) {
    console.error("Error logging voice command:", error);
    res.status(500).json({ message: "Failed to log voice command" });
  }
};
