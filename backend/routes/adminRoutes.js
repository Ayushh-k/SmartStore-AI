// backend/routes/adminRoutes.js

import express from "express";
import { getAllOrders } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/orders", protect, admin, getAllOrders);

export default router;
