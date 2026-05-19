import fs from "fs";
import { extractNutritionFromImage } from "../services/aiNutritionService.js";

// Takes a photo of a nutrition label and returns parsed nutrition info.
// Frontend uses this to auto-fill the manual add form.
export const scanNutritionLabel = async (req, res) => {
  let imagePath;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    imagePath = req.file.path;

    const nutrition = await extractNutritionFromImage(imagePath);
    res.status(200).json(nutrition);
  } catch (error) {
    console.log("[AI SCAN] error:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    // Clean up the uploaded file
    if (imagePath && fs.existsSync(imagePath)) {
      try { fs.unlinkSync(imagePath); } catch (_) {}
    }
  }
};
