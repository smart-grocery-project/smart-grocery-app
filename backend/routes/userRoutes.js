import express from "express";
import { createUser, getUsers, loginUser, changePassword } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);

router.post("/login", loginUser);

router.get("/", protect, getUsers);

router.put("/password", protect, changePassword);

export default router;