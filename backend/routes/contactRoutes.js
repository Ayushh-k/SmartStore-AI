// backend/routes/contactRoutes.js
import express from "express";
import { handleContactSubmit } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", handleContactSubmit);

export default router;
