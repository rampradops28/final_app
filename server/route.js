import { createServer } from "http";
import authRoutes from "./routes/authRoutes.js";
import billItemRoutes from "./routes/billItemRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import voiceCommandRoutes from "./routes/voiceCommandRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import voiceAuthRoutes from "./routes/voiceAuthRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

export async function registerRoutes(app) {
  // Mount modular routers with same base paths
  app.use("/api/auth", authRoutes);
  app.use("/api/bill-items", billItemRoutes);
  app.use("/api/bill", billRoutes);
  app.use("/api/voice-commands", voiceCommandRoutes);
  app.use("/api/learning", learningRoutes);
  app.use("/api/voice-auth", voiceAuthRoutes);
  app.use("/api/sms", smsRoutes);
  app.use("/api/stats", statsRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
