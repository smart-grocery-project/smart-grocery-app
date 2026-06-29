import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendResetCodeEmail } from "../services/emailService.js";

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return safe response
    const { password: _, ...userWithoutPassword } = user._doc;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      // { expiresIn: "1h" }
    );

    // Return safe response
    const { password: _, ...userWithoutPassword } = user._doc;
    res.status(200).json({user: userWithoutPassword,  token,});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD (authenticated user)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the current password before allowing a change
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD — emails a 6-digit reset code
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond success (don't reveal whether the email exists)
    if (user) {
      const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
      user.resetCode = await bcrypt.hash(code, 10);
      user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
      await user.save();

      try {
        await sendResetCodeEmail(user.email, code);
      } catch (mailErr) {
        return res.status(500).json({ message: "Could not send reset email. Try again later." });
      }
    }

    res.status(200).json({ message: "If that email exists, a reset code has been sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD — verifies the code and sets a new password
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }
    if (user.resetCodeExpires < new Date()) {
      return res.status(400).json({ message: "Reset code has expired. Request a new one." });
    }

    const isMatch = await bcrypt.compare(code, user.resetCode);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};