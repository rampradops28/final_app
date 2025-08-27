import { storage } from "../storage.js";

export const getTodayStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await storage.getTodayStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
