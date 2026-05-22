// backend/routes/storeRoutes.js

import express from "express";
import {
  getPublicProducts,
  addToCart,
  getCart,
  checkout,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/products", getPublicProducts);

// Protected routes (require user login)
router.post("/cart", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart/:productId", protect, updateCartQuantity);
router.delete("/cart/:productId", protect, removeFromCart);
router.post("/checkout", protect, checkout);

export default router;
