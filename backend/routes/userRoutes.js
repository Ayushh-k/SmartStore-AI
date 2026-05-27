// backend/routes/userRoutes.js

import express from "express";
import {
  getUserProfile,
  updateProfile,
  toggleWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  updatePassword,
  requestOrderReturn,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected by the protect middleware
router.use(protect);

router.route("/profile")
  .get(getUserProfile)
  .put(updateProfile);

router.post("/wishlist/toggle", toggleWishlist);
router.post("/wishlist", toggleWishlist);
router.put("/update-password", updatePassword);

router.post("/address", addAddress);
router.route("/address/:addressId")
  .put(updateAddress)
  .delete(deleteAddress);

router.put("/orders/:id/return", requestOrderReturn);

export default router;
