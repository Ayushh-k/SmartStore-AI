// backend/controllers/adminController.js

import Order from "../models/Order.js";

/**
  Get all orders in the system. Sorted by newest first.
  Populates user information and product details.
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error fetching order history." });
  }
};
