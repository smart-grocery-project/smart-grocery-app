import express from "express";
import { upsertWeeklyPlan, getWeeklyPlan } from "../controllers/weeklyPlanController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, upsertWeeklyPlan);
router.get("/", protect, getWeeklyPlan);

export default router;