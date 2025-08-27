import { storage } from "../storage.js";

export const getLearning = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    const content = await storage.getLearningContent(userId, type);
    res.json(content);
  } catch (error) {
    console.error("Error fetching learning content:", error);
    res.status(500).json({ message: "Failed to fetch learning content" });
  }
};

export const addLearning = async (req, res) => {
  try {
    const content = await storage.addLearningContent(req.body);
    res.json(content);
  } catch (error) {
    console.error("Error adding learning content:", error);
    res.status(500).json({ message: "Failed to add learning content" });
  }
};
