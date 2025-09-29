import { Router } from "express";
import { sendSMS, sendInvoiceMMS } from "../controllers/smsController.js";

const router = Router();

router.post("/send", sendSMS);
router.post("/send-invoice", sendInvoiceMMS);

export default router;
