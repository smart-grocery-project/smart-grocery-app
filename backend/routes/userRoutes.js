import express from "express";
import { createUser, getUsers, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);

router.post("/login", loginUser);

router.get("/", protect, getUsers);

export default router;