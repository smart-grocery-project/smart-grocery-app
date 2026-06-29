import express from "express";
import { createHistory, addHistoryItem, getHistory, clearHistory } from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createHistory);
router.post("/items", protect, addHistoryItem);
router.get("/", protect, getHistory);
router.delete("/items", protect, clearHistory);

export default router;