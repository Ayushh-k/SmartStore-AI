// backend/controllers/userController.js

import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import bcrypt from "bcrypt";

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

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email.toLowerCase();
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    
    // settings
    if (user.profileSettings) {
      if (req.body.language !== undefined) user.profileSettings.language = req.body.language;
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
  Body: { tag, name, phone, street, city, state, pincode, zipCode, country, isDefault }
 */
export const addAddress = async (req, res) => {
  try {
    const { tag = "", name = "", phone = "", street, city, state, pincode, zipCode, country = "India", isDefault = false } = req.body;

    const resolvedZip = zipCode || pincode;
    const resolvedPin = pincode || zipCode;

    if (!street || !city || !state || !resolvedZip) {
      return res.status(400).json({ message: "Street, City, State, and Pincode are required." });
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
      tag,
      name,
      phone,
      pincode: resolvedPin,
      street,
      city,
      state,
      zipCode: resolvedZip,
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
  Body: { tag, name, phone, street, city, state, pincode, zipCode, country, isDefault }
 */
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { tag, name, phone, street, city, state, pincode, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    if (tag !== undefined) address.tag = tag;
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (country !== undefined) address.country = country;

    if (zipCode !== undefined || pincode !== undefined) {
      const resolvedZip = zipCode || pincode;
      const resolvedPin = pincode || zipCode;
      address.zipCode = resolvedZip;
      address.pincode = resolvedPin;
    }
    
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

/**
  Update user's own password from dashboard profile.
  Body: { oldPassword, newPassword, confirmPassword }
 */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match." });
    }

    // Fetch the user including the hidden password field
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Hash the new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error updating password." });
  }
};

/**
  Submit a return request for an order.
  Params: id (orderId)
  Body: { reason }
 */
export const requestOrderReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Return reason is required." });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned." });
    }

    const deliveryEntry = order.trackingHistory.find((h) => h.status === "Delivered");
    if (!deliveryEntry) {
      return res.status(400).json({ message: "Delivery tracking timestamp not found." });
    }

    const deliveryDate = new Date(deliveryEntry.timestamp);
    const tenDaysInMillis = 10 * 24 * 60 * 60 * 1000;
    if (Date.now() - deliveryDate.getTime() > tenDaysInMillis) {
      return res.status(400).json({ message: "The 10-day return policy window has expired for this order." });
    }

    order.status = "Return Pending";
    order.returnStatus = "Return Pending";
    order.returnReason = reason;

    order.trackingHistory.push({
      status: "Return Pending",
      message: `Return request submitted by customer. Reason: ${reason}`,
      location: order.shippingAddress?.city || "Customer Residence",
      timestamp: new Date(),
    });

    await order.save();

    res.status(200).json({
      message: "Return request submitted successfully. Awaiting vendor review.",
      order,
    });
  } catch (error) {
    console.error("Request order return error:", error);
    res.status(500).json({ message: "Failed to submit return request." });
  }
};
