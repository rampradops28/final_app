import { UserModel } from "./models/User.js";
import { BillItemModel } from "./models/BillItem.js";
import { BillModel } from "./models/Bill.js";
import { VoiceCommandModel } from "./models/VoiceCommand.js";
import { VoicePrintModel } from "./models/VoicePrint.js";
import { LearningContentModel } from "./models/LearningContent.js";

class MongoStorage {
  constructor() {
    // ensure default admin exists
    this.ensureAdmin();
  }

  async ensureAdmin() {
    const existing = await UserModel.findOne({ username: "admin" }).lean();
    if (!existing) {
      await UserModel.create({ username: "admin", password: "password123", name: "Admin User" });
    }
  }

  // User operations
  async getUser(id) {
    const user = await UserModel.findById(id).lean();
    if (!user) return undefined;
    return { id: String(user._id), username: user.username, password: user.password, name: user.name, createdAt: user.createdAt };
  }

  async getUserByUsername(username) {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return undefined;
    return { id: String(user._id), username: user.username, password: user.password, name: user.name, createdAt: user.createdAt };
  }

  async createUser(insertUser) {
    const created = await UserModel.create(insertUser);
    return { id: String(created._id), username: created.username, password: created.password, name: created.name, createdAt: created.createdAt };
  }

  // Bill item operations
  async getBillItems(userId, sessionId) {
    const items = await BillItemModel.find({ userId, sessionId }).sort({ createdAt: 1 }).lean();
    return items.map((it) => ({ id: String(it._id), userId: it.userId, sessionId: it.sessionId, name: it.name, quantity: it.quantity, rate: it.rate, amount: it.amount, createdAt: it.createdAt }));
  }

  async addBillItem(item) {
    const created = await BillItemModel.create(item);
    return { id: String(created._id), userId: created.userId, sessionId: created.sessionId, name: created.name, quantity: created.quantity, rate: created.rate, amount: created.amount, createdAt: created.createdAt };
  }

  async removeBillItem(id) {
    await BillItemModel.findByIdAndDelete(id);
  }

  async clearBillItems(userId, sessionId) {
    await BillItemModel.deleteMany({ userId, sessionId });
  }

  // Bill operations
  async getBill(userId, sessionId) {
    const bill = await BillModel.findOne({ userId, sessionId, status: "active" }).lean();
    if (!bill) return null;
    return { id: String(bill._id), userId: bill.userId, sessionId: bill.sessionId, totalAmount: bill.totalAmount || 0, customerPhone: bill.customerPhone || null, status: bill.status, createdAt: bill.createdAt };
  }

  async createOrUpdateBill(billData) {
    const updated = await BillModel.findOneAndUpdate(
      { userId: billData.userId, sessionId: billData.sessionId, status: "active" },
      {
        $set: {
          totalAmount: billData.totalAmount ?? 0,
          customerPhone: billData.customerPhone ?? null,
          status: billData.status || "active",
        },
      },
      { upsert: true, new: true }
    ).lean();
    return { id: String(updated._id), userId: updated.userId, sessionId: updated.sessionId, totalAmount: updated.totalAmount || 0, customerPhone: updated.customerPhone || null, status: updated.status, createdAt: updated.createdAt };
  }

  // Voice command operations
  async addVoiceCommand(command) {
    const created = await VoiceCommandModel.create({ ...command, success: command.success ?? true });
    return { id: String(created._id), userId: created.userId, command: created.command, intent: created.intent, success: !!created.success, meta: created.meta, createdAt: created.createdAt };
  }

  async getVoiceCommands(userId) {
    const rows = await VoiceCommandModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return rows.map((r) => ({ id: String(r._id), userId: r.userId, command: r.command, intent: r.intent, success: !!r.success, meta: r.meta, createdAt: r.createdAt }));
  }

  // Stats operations
  async getTodayStats(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [billsAgg, commandsCount, itemsCount] = await Promise.all([
      BillModel.aggregate([
        { $match: { userId, createdAt: { $gte: today } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      ]),
      VoiceCommandModel.countDocuments({ userId, createdAt: { $gte: today } }),
      BillItemModel.countDocuments({ userId, createdAt: { $gte: today } }),
    ]);

    const todayBills = billsAgg[0]?.count || 0;
    const todayRevenue = billsAgg[0]?.revenue || 0;

    return {
      todayBills,
      todayRevenue,
      voiceCommands: commandsCount,
      itemsSold: itemsCount,
    };
  }

  // Voice print operations
  async addVoicePrint(voicePrintData) {
    const created = await VoicePrintModel.create({ userId: voicePrintData.userId, embedding: voicePrintData.embedding, isActive: voicePrintData.isActive ?? true });
    return { id: String(created._id), userId: created.userId, isActive: !!created.isActive, createdAt: created.createdAt };
  }

  async getVoicePrints(userId) {
    const rows = await VoicePrintModel.find({ userId, isActive: true }).lean();
    return rows.map((r) => ({ id: String(r._id), userId: r.userId, isActive: !!r.isActive, createdAt: r.createdAt }));
  }

  async verifyVoicePrint(userId, voiceData) {
    // Placeholder verification; replace with MFCC + cosine similarity
    const userPrints = await VoicePrintModel.find({ userId, isActive: true }).lean();
    if (userPrints.length === 0) return true;
    return Math.random() > 0.3;
  }

  // Learning content operations
  async addLearningContent(contentData) {
    const created = await LearningContentModel.create({ ...contentData, language: contentData.language || "en" });
    return { id: String(created._id), userId: created.userId, type: created.type, title: created.title, language: created.language, content: created.content, createdAt: created.createdAt };
  }

  async getLearningContent(userId, type) {
    const query = { userId };
    if (type) query.type = type;
    const rows = await LearningContentModel.find(query).sort({ createdAt: -1 }).lean();
    return rows.map((r) => ({ id: String(r._id), userId: r.userId, type: r.type, title: r.title, language: r.language, content: r.content, createdAt: r.createdAt }));
  }
}

export const storage = new MongoStorage();
