// backend/controllers/productController.js

import Product from "../models/Product.js";

/**
  Fetch a single product by its ID.
  Returns full product details (sizes, colors, stock, brand, category, etc.).
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product details by ID error:", error);
    res.status(500).json({ message: "Failed to fetch product details." });
  }
};
