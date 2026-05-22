// backend/controllers/userController.js

import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
  Get user profile along with order history, addresses, and wishlist.
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch order history for this user
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json({
      user,
      orders,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error retrieving profile details." });
  }
};

/**
  Update general settings & info for the user.
  Body: { name, email, language, notifications }
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email.toLowerCase();
    
    // settings
    if (user.profileSettings) {
      if (req.body.language) user.profileSettings.language = req.body.language;
      if (req.body.notifications !== undefined) user.profileSettings.notifications = req.body.notifications;
    } else {
      user.profileSettings = {
        language: req.body.language || "en",
        notifications: req.body.notifications !== undefined ? req.body.notifications : true,
      };
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user._id).select("-password").populate("wishlist");
    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already taken." });
    }
    res.status(500).json({ message: "Server error updating profile details." });
  }
};

/**
  Toggle wishlist presence for a product ID.
  Body: { productId }
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isWishlisted = req.user.wishlist && req.user.wishlist.some(id => id.toString() === productId.toString());

    if (isWishlisted) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { wishlist: productId }
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { wishlist: productId }
      });
    }

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    res.status(500).json({ message: "Server error toggling wishlist." });
  }
};

/**
  Add address to address book.
  Body: { street, city, state, zipCode, country, isDefault }
 */
export const addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault = false } = req.body;

    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: "All address fields are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If setting default, unset others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: user.addresses.length === 0 ? true : isDefault, // default if first
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Server error adding address." });
  }
};

/**
  Update an existing address.
  Params: addressId
  Body: { street, city, state, zipCode, country, isDefault }
 */
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
      if (isDefault) {
        user.addresses.forEach((addr) => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Server error updating address." });
  }
};

/**
  Delete an address.
  Params: addressId
 */
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    // If we deleted the default address, make the first remaining one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error deleting address." });
  }
};
