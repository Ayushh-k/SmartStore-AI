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
  getAllPlatformProducts,
  getAllUsers,
  toggleUserBan,
  deleteUser,
  getUserActivity,
} from "../controllers/developerController.js";

const router = express.Router();

// Platform Metrics (revenue, stores, products + 7-day time series trends)
router.get("/metrics", protect, superadmin, getPlatformMetrics);

// Store / Vendor Management
router.get("/vendors", protect, superadmin, getAllStores);
router.put("/vendors/:id/ban", protect, superadmin, toggleStoreBan);
router.delete("/vendors/:id", protect, superadmin, deleteStore);

// User / Customer Management
router.get("/users", protect, superadmin, getAllUsers);
router.put("/users/:id/ban", protect, superadmin, toggleUserBan);
router.delete("/users/:id", protect, superadmin, deleteUser);
router.get("/users/:id/activity", protect, superadmin, getUserActivity);

// Catalog Drill-Down & Moderation
router.get("/products", protect, superadmin, getAllPlatformProducts);
router.get("/vendors/:vendorId/catalog", protect, superadmin, getStoreCatalog);
router.delete("/products/:id", protect, superadmin, deleteProduct);

export default router;
