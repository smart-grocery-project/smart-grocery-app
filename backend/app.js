import express from "express";
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import weeklyPlanRoutes from "./routes/weeklyPlanRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";

const app = express();
app.use(express.json());
app.use("/users", userRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);
app.use("/history", historyRoutes);
app.use("/weekly-plan", weeklyPlanRoutes);
app.use("/scanner", scannerRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

export default app;