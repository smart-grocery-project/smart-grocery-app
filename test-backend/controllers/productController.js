import Product from "../models/Product.js";

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const { name, price, nutrition } = req.body;

    const product = await Product.create({
      name,
      price,
      nutrition,
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