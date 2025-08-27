import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { insertLearningContentSchema } from "../schema.js";
import { getLearning, addLearning } from "../controllers/learningController.js";

const router = Router();

router.get("/:userId", getLearning);
router.post("/", validate(insertLearningContentSchema), addLearning);

export default router;
