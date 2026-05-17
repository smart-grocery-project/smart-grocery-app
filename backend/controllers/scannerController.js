import { extractBarcodeFromImage } from "../services/barcodeService.js";
import { findOrCreateProductByBarcode } from "../services/productService.js";

export const scanBarcode = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imagePath = req.file.path;

    const barcode = await extractBarcodeFromImage(imagePath);

    if (!barcode) {
      return res.status(400).json({
        message: "Barcode could not be detected",
      });
    }

    const product = await findOrCreateProductByBarcode(barcode);

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};