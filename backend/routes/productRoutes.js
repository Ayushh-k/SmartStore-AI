// backend/routes/productRoutes.js

import express from "express";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
  Admin CRUD for Products.
 */

// Create product
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product." });
  }
});

// Get all products
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
});

// Get unique audiences and keywords from existing products (must reside before GET /:id)
router.get("/meta/values", protect, admin, async (req, res) => {
  try {
    const audiences = await Product.distinct("audience");
    const keywords = await Product.distinct("keywords");
    res.json({
      audiences: audiences.filter(Boolean),
      keywords: keywords.filter(Boolean)
    });
  } catch (error) {
    console.error("Get product meta values error:", error);
    res.status(500).json({ message: "Failed to fetch distinct meta values." });
  }
});

// Get single product
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(prod);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product." });
  }
});

// Update product
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const prod = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!prod) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(prod);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product." });
  }
});

// Delete product
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.id);
    if (!prod) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product." });
  }
});

export default router;
