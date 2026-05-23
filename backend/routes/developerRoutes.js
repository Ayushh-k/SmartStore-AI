// backend/routes/developerRoutes.js
import express from "express";
import { protect, superadmin } from "../middleware/authMiddleware.js";
import {
  getPlatformMetrics,
  getAllStores,
  toggleStoreBan,
  deleteStore,
  getStoreCatalog,
  deleteProduct,
} from "../controllers/developerController.js";

const router = express.Router();

// Platform Metrics (revenue, stores, products + 7-day time series trends)
router.get("/metrics", protect, superadmin, getPlatformMetrics);

// Store / Vendor Management
router.get("/vendors", protect, superadmin, getAllStores);
router.put("/vendors/:id/ban", protect, superadmin, toggleStoreBan);
router.delete("/vendors/:id", protect, superadmin, deleteStore);

// Catalog Drill-Down & Moderation
router.get("/vendors/:vendorId/catalog", protect, superadmin, getStoreCatalog);
router.delete("/products/:id", protect, superadmin, deleteProduct);

export default router;
