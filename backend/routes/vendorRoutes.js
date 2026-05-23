// backend/routes/vendorRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getVendorDashboard,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  updateStoreSettings,
} from "../controllers/vendorController.js";

const router = express.Router();

// Dashboard stats
router.get("/dashboard", protect, admin, getVendorDashboard);

// Products CRUD
router.get("/products", protect, admin, getVendorProducts);
router.post("/products", protect, admin, createVendorProduct);
router.put("/products/:id", protect, admin, updateVendorProduct);
router.delete("/products/:id", protect, admin, deleteVendorProduct);

// Orders
router.get("/orders", protect, admin, getVendorOrders);

// Store settings
router.put("/settings", protect, admin, updateStoreSettings);

export default router;
