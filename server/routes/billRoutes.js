import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { insertBillSchema } from "../schema.js";
import { getBill, upsertBill } from "../controllers/billController.js";

const router = Router();

router.get("/:userId/:sessionId", getBill);
router.post("/", validate(insertBillSchema), upsertBill);

export default router;
