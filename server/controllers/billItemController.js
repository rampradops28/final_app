import { storage } from "../storage.js";

export const getItems = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const items = await storage.getBillItems(userId, sessionId);
    res.json(items);
  } catch (error) {
    console.error("Error fetching bill items:", error);
    res.status(500).json({ message: "Failed to fetch bill items" });
  }
};

export const addItem = async (req, res) => {
  try {
    const item = await storage.addBillItem(req.body);
    res.json(item);
  } catch (error) {
    console.error("Error adding bill item:", error);
    res.status(500).json({ message: "Failed to add bill item" });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { id } = req.params;
    await storage.removeBillItem(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing bill item:", error);
    res.status(500).json({ message: "Failed to remove bill item" });
  }
};

export const clearItems = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    await storage.clearBillItems(userId, sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing bill items:", error);
    res.status(500).json({ message: "Failed to clear bill items" });
  }
};
