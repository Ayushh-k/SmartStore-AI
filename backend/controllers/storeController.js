// backend/controllers/storeController.js

import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

/**
  Fetch all active/available products for the storefront.
 */
export const getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get public products error:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

/**
  Add a product ID and quantity to the logged-in user's cart.
  Body: { productId, quantity }
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if item already exists in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Update quantity
      user.cart[itemIndex].quantity += qty;
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();

    // Populate user's cart to return it
    const populatedUser = await User.findById(req.user._id).populate("cart.product");

    res.json({
      message: "Item added to cart.",
      cart: populatedUser.cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add item to cart." });
  }
};

/**
  Get the populated cart for the logged-in user.
 */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user.cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart." });
  }
};

/**
  Checkout cart: verifies stock, calculates total, creates Order, decrements stock, clears cart.
 */
export const checkout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Verify stock availability and calculate total
    for (const item of user.cart) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ message: "Product in cart no longer exists." });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      totalAmount += product.price * item.quantity;
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    // Create the Order document
    const order = await Order.create({
      user: user._id,
      products: orderProducts,
      totalAmount,
      status: "completed", // Completes instantly as a mock checkout flow
    });

    // Update product stocks
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Checkout failed. Server error." });
  }
};

/**
  Remove a product from the logged-in user's cart.
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(populatedUser.cart);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};

/**
  Update quantity for a product in the logged-in user's cart.
  Body: { quantity }
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Invalid quantity. Must be at least 1." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    user.cart[itemIndex].quantity = qty;
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(populatedUser.cart);
  } catch (error) {
    console.error("Update cart quantity error:", error);
    res.status(500).json({ message: "Failed to update quantity in cart." });
  }
};
