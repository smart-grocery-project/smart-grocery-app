import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

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
      { expiresIn: "1h" }
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

    // const safeUsers = users.map((user) => {
    //   const { password: _, ...rest } = user._doc;
    //   return rest;
    // });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};