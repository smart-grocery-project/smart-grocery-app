import express from "express";
import { createHistory, addHistoryItem, getHistory } from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createHistory);
router.post("/items", protect, addHistoryItem);
router.get("/", protect, getHistory);

export default router;