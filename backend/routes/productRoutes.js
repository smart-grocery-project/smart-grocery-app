import express from "express";
import { createProduct, getProducts, updateProduct, compareProduct } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProduct);
router.get("/", protect, getProducts);
router.put("/:id", protect, updateProduct);
router.post("/:id/compare", protect, compareProduct);

export default router;