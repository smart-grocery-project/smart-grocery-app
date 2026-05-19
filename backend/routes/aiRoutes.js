import express from "express";
import { scanNutritionLabel } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/scan-label", protect, upload.single("image"), scanNutritionLabel);

export default router;
