// backend/routes/notificationRoutes.js

import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { markSingleNotificationRead } from "../controllers/notificationController.js";

const router = express.Router();

router.put("/:id/read", protect, admin, markSingleNotificationRead);

export default router;
