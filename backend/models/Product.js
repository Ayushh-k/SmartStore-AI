// backend/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    captions: [
      {
        platform: {
          type: String,
          enum: ["instagram", "facebook", "twitter", "tiktok", "generic"],
          default: "generic",
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
