// backend/routes/dashboardRoutes.js

import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getDashboardData);

export default router;
