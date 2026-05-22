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
    audience: {
      type: String,
      trim: true,
      default: "",
    },
    keywords: {
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
    priceHistory: [
      {
        price: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reviews: [
      {
        user: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          default: "",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware to log price history
productSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("price")) {
    this.priceHistory.push({
      price: this.price,
      date: new Date(),
    });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
