// backend/routes/authRoutes.js

import express from "express";
import { register, login, verifyAccount, resendOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyAccount);
router.post("/resend-otp", resendOtp);

export default router;
