import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { insertVoicePrintSchema } from "../schema.js";
import { registerVoice, verifyVoice } from "../controllers/voiceAuthController.js";

const router = Router();

router.post("/register", validate(insertVoicePrintSchema), registerVoice);
router.post("/verify", verifyVoice);

export default router;
