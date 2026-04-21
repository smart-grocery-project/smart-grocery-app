import express from "express";
import { createInventory, getInventory, addItem, removeItem, updateItemQuantity, getExpiringItems } from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInventory);

router.get("/", protect, getInventory);

router.post("/items", protect, addItem);

router.delete("/items/:itemId", protect, removeItem);

router.put("/items/:itemId", protect, updateItemQuantity);

router.get("/items/expired", protect, getExpiringItems);

export default router;