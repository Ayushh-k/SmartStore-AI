// backend/models/Sale.js

import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
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
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    channel: {
      type: String,
      enum: ["web", "mobile", "store", "marketplace"],
      default: "web",
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
