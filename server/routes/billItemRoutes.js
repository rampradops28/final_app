import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { insertBillItemSchema } from "../schema.js";
import { getItems, addItem, removeItem, clearItems } from "../controllers/billItemController.js";

const router = Router();

router.get("/:userId/:sessionId", getItems);
router.post("/", validate(insertBillItemSchema), addItem);
router.delete("/:id", removeItem);
router.delete("/:userId/:sessionId/clear", clearItems);

export default router;
