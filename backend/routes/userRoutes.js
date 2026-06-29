import express from "express";
import { createUser, getUsers, loginUser, changePassword, forgotPassword, resetPassword } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);

router.post("/login", loginUser);

router.get("/", protect, getUsers);

router.put("/password", protect, changePassword);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;