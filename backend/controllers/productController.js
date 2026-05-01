import Product from "../models/Product.js";
import WeeklyPlan from "../models/WeeklyPlan.js";
import { compareProductToPlan } from "../services/comparatorService.js";

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const { barcode, name, price, nutrition } = req.body;

    // Prevent duplicates by barcode
    const existingProduct = await Product.findOne({ barcode });

    if (existingProduct) {
      return res.status(400).json({
        message: "Product with this barcode already exists",
      });
    }

    const product = await Product.create({
      barcode,
      name,
      price,
      nutrition: {
        calories: nutrition?.calories || 0,
        protein: nutrition?.protein || 0,
        carbs: nutrition?.carbs || 0,
        fat: nutrition?.fat || 0,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COMPARE product with weekly plan
export const compareProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Get product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get user's weekly plan
    const plan = await WeeklyPlan.findOne({ user: userId });

    if (!plan) {
      return res.status(404).json({ message: "Weekly plan not found" });
    }

    // Run comparator
    const result = compareProductToPlan(product, plan);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};