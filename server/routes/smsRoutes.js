import { Router } from "express";
import { sendSMS } from "../controllers/smsController.js";

const router = Router();

router.post("/send", sendSMS);

export default router;
