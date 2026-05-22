// backend/routes/aiRoutes.js

import express from "express";
import { generateProductContent } from "../controllers/aiController.js";
import {
  semanticSearch,
  productQA,
  sizePredictor,
  priceInsights,
  reviewSummarizer,
  aiStylist,
} from "../controllers/userAiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected Admin AI generation endpoint
router.post("/generate", protect, admin, generateProductContent);

// Protected User Smart Shopping Assistant AI endpoints
router.post("/user/search", protect, semanticSearch);
router.post("/user/qa", protect, productQA);
router.post("/user/size", protect, sizePredictor);
router.get("/user/price-insights/:productId", protect, priceInsights);
router.get("/user/review-summary/:productId", protect, reviewSummarizer);
router.post("/user/stylist", protect, aiStylist);

export default router;
