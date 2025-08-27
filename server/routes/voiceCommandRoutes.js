import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { insertVoiceCommandSchema } from "../schema.js";
import { addVoiceCommand } from "../controllers/voiceCommandController.js";

const router = Router();

router.post("/", validate(insertVoiceCommandSchema), addVoiceCommand);

export default router;
