// backend/routes/developerRoutes.js
import express from "express";
import { protect, superadmin } from "../middleware/authMiddleware.js";
import {
  getGlobalMetrics,
  getAllVendors,
  getAllPlatformProducts,
  deleteAnyProduct,
} from "../controllers/developerController.js";

const router = express.Router();

// Platform Metrics
router.get("/metrics", protect, superadmin, getGlobalMetrics);

// Store / Vendor Management
router.get("/vendors", protect, superadmin, getAllVendors);

// Product Moderation
router.get("/products", protect, superadmin, getAllPlatformProducts);
router.delete("/products/:id", protect, superadmin, deleteAnyProduct);

export default router;
