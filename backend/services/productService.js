import Product from "../models/Product.js";

// Fetch product from Open Food Facts
const fetchFromAPI = async (barcode) => {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  );

  if (!response.ok) {
    throw new Error("External API request failed");
  }

  const data = await response.json();

  if (data.status === 0) {
    return null; // product not found
  }

  return data.product;
};

// Map API data → your schema
const mapToProductSchema = (barcode, apiProduct) => {
  return {
    barcode,
    name: apiProduct.product_name || "Unknown Product",
    price: 0,
    nutrition: {
      calories: apiProduct.nutriments?.["energy-kcal_100g"] || 0,
      protein: apiProduct.nutriments?.proteins_100g || 0,
      carbs: apiProduct.nutriments?.carbohydrates_100g || 0,
      fat: apiProduct.nutriments?.fat_100g || 0,
    },
  };
};

// Main pipeline function
export const findOrCreateProductByBarcode = async (barcode) => {
  let product = await Product.findOne({ barcode });

  if (product) {
    return product;
  }

  const apiProduct = await fetchFromAPI(barcode);

  if (!apiProduct) {
    throw new Error("Product not found in external API");
  }

  const productData = mapToProductSchema(barcode, apiProduct);

  product = await Product.create(productData);

  return product;
};