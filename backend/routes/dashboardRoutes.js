// backend/routes/dashboardRoutes.js

import express from "express";
import { 
  getDashboardData,
  getNotifications,
  markNotificationsRead
} from "../controllers/dashboardController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getDashboardData);
router.get("/notifications", protect, admin, getNotifications);
router.put("/notifications/read", protect, admin, markNotificationsRead);

export default router;
