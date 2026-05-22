// backend/routes/storeRoutes.js

import express from "express";
import {
  getPublicProducts,
  getPublicProduct,
  addToCart,
  getCart,
  checkout,
  removeFromCart,
  updateCartQuantity,
  batchUpdateCart,
} from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/products", getPublicProducts);
router.get("/products/:id", getPublicProduct);

// Protected routes (require user login)
router.post("/cart", protect, addToCart);
router.post("/cart/batch", protect, batchUpdateCart);
router.get("/cart", protect, getCart);
router.put("/cart/:productId", protect, updateCartQuantity);
router.delete("/cart/:productId", protect, removeFromCart);
router.post("/checkout", protect, checkout);

export default router;
