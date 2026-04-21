import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/users", userRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);
app.use("/history", historyRoutes);

const PORT = 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});