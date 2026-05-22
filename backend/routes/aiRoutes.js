// backend/routes/aiRoutes.js

import express from "express";
import { generateProductContent } from "../controllers/aiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected AI generation endpoint
router.post("/generate", protect, admin, generateProductContent);

export default router;
