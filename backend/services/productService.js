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

// Picks the best available name from the API response.
// Open Food Facts stores names in several language fields — fall back through them.
const pickBestName = (apiProduct) => {
  return (
    apiProduct.product_name ||
    apiProduct.product_name_en ||
    apiProduct.product_name_fr ||
    apiProduct.product_name_ar ||
    apiProduct.generic_name ||
    apiProduct.generic_name_en ||
    apiProduct.brands ||
    apiProduct.abbreviated_product_name ||
    "Unknown Product"
  );
};

// Map API data → your schema
const mapToProductSchema = (barcode, apiProduct) => {
  return {
    barcode,
    name: pickBestName(apiProduct),
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

  // If cached but had a bad name, re-fetch from API and update it
  if (product && product.name && product.name !== "Unknown Product") {
    return product;
  }

  const apiProduct = await fetchFromAPI(barcode);

  if (!apiProduct) {
    throw new Error("Product not found in external API");
  }

  const productData = mapToProductSchema(barcode, apiProduct);

  if (product) {
    // Update the existing bad-name entry with the better name
    Object.assign(product, productData);
    await product.save();
  } else {
    product = await Product.create(productData);
  }

  return product;
};