import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";
import History from "../models/History.js";
import Inventory from "../models/Inventory.js";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await User.deleteMany({});
  await Inventory.deleteMany({});
  await History.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});