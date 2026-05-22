// backend/models/Order.js

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
          min: 0,
        },
        selectedSize: {
          type: String,
          default: "",
        },
        selectedColor: {
          type: String,
          default: "",
        },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentDetails: {
      method: { type: String, required: true },
      status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

