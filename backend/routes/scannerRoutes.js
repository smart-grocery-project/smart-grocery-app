import express from "express";
import { scanBarcode, lookupBarcode } from "../controllers/scannerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/",        protect, upload.single("image"), scanBarcode);
router.post("/barcode", protect, lookupBarcode);

export default router;