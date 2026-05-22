// backend/controllers/storeController.js

import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Sale from "../models/Sale.js";
import Notification from "../models/Notification.js";
import { sendOrderConfirmationEmail } from "../utils/mailer.js";

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
  Fetch a single active product by ID for storefront/share view.
 */
export const getPublicProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found or inactive." });
    }
    res.json(product);
  } catch (error) {
    console.error("Get public product error:", error);
    res.status(500).json({ message: "Failed to fetch product details." });
  }
};


/**
  Add a product ID and quantity to the logged-in user's cart.
  Body: { productId, quantity, selectedSize, selectedColor }
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedSize = "", selectedColor = "" } = req.body;
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

    // Check if item already exists in cart with matching size and color
    const itemIndex = user.cart.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (item.selectedSize || "") === selectedSize &&
        (item.selectedColor || "") === selectedColor
    );

    if (itemIndex > -1) {
      // Update quantity
      user.cart[itemIndex].quantity += qty;
    } else {
      // Add new item with variations
      user.cart.push({
        product: productId,
        quantity: qty,
        selectedSize,
        selectedColor,
      });
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
  Body: { shippingAddress, paymentMethod }
 */
export const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "Card" } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required." });
    }

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
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
      });
    }

    // Create the Order document
    const order = await Order.create({
      user: user._id,
      products: orderProducts,
      shippingAddress,
      paymentDetails: {
        method: paymentMethod,
        status: "Completed",
      },
      totalAmount,
      status: "completed", // Completes instantly as a mock checkout flow
    });

    // Update product stocks & Create Sale documents
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });

      await Sale.create({
        product: item.product._id,
        quantity: item.quantity,
        totalAmount: item.product.price * item.quantity,
        saleDate: new Date(),
        channel: "web",
      });
    }

    // Create admin notification
    await Notification.create({
      type: "purchase",
      message: `New purchase by ${user.name}! Bought ${user.cart.reduce((sum, item) => sum + item.quantity, 0)} product(s) for a total of $${totalAmount.toFixed(2)}.`,
    });

    // Clear user's cart
    user.cart = [];
    await user.save();

    // Send luxury order confirmation email (non-blocking)
    try {
      const populatedOrder = await Order.findById(order._id).populate("products.product");
      sendOrderConfirmationEmail(user.email, user.name, populatedOrder);
    } catch (mailError) {
      console.error("Mail dispatch error (non-critical):", mailError);
    }

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
    const { size = "", color = "" } = req.query;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.cart = user.cart.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          (item.selectedSize || "") === size &&
          (item.selectedColor || "") === color
        )
    );
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
  Body: { quantity, size, color }
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, size = "", color = "" } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Invalid quantity. Must be at least 1." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const itemIndex = user.cart.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (item.selectedSize || "") === size &&
        (item.selectedColor || "") === color
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

/**
  Batch import/update cart.
  Body: { items: [{ id, q, selectedSize, selectedColor }], replace: boolean }
 */
export const batchUpdateCart = async (req, res) => {
  try {
    const { items, replace } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid request. items must be an array." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (replace) {
      user.cart = [];
    }

    for (const item of items) {
      const { id, q, selectedSize = "", selectedColor = "" } = item;
      const qty = Number(q) || 1;
      
      // Verify product exists
      const product = await Product.findById(id);
      if (!product) continue; // skip non-existent products

      const itemIndex = user.cart.findIndex(
        (cItem) =>
          cItem.product.toString() === id &&
          (cItem.selectedSize || "") === selectedSize &&
          (cItem.selectedColor || "") === selectedColor
      );

      if (itemIndex > -1) {
        user.cart[itemIndex].quantity += qty;
      } else {
        user.cart.push({
          product: id,
          quantity: qty,
          selectedSize,
          selectedColor,
        });
      }
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate("cart.product");

    res.json({
      message: "Cart imported successfully.",
      cart: populatedUser.cart,
    });
  } catch (error) {
    console.error("Batch update cart error:", error);
    res.status(500).json({ message: "Failed to import shared cart." });
  }
};


