import express from "express";
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import weeklyPlanRoutes from "./routes/weeklyPlanRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: "10mb" }));
app.use("/users", userRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);
app.use("/history", historyRoutes);
app.use("/weekly-plan", weeklyPlanRoutes);
app.use("/scanner", scannerRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

export default app;