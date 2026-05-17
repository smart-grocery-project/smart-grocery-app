import express from "express";
import { createProduct, getProducts } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { compareProduct } from "../controllers/productController.js";

const router = express.Router();

router.post("/", protect, createProduct);
router.get("/", protect, getProducts);
router.post("/:id/compare", protect, compareProduct);

export default router;