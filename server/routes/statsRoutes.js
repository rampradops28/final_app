import { Router } from "express";
import { getTodayStats } from "../controllers/statsController.js";

const router = Router();

router.get("/:userId", getTodayStats);

export default router;
