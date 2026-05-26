// backend/factoryReset.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Sale from "./models/Sale.js";
import Notification from "./models/Notification.js";

dotenv.config();

const resetAndSecure = async () => {
  try {
    const mongoUri = process.env.MONGOURI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGOURI or MONGO_URI is not defined in the environment variables.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    // 1. Data Wipe (clear Product, Order, Sale, Notification, and user carts)
    console.log("Wiping collections...");
    const productReset = await Product.deleteMany({});
    const orderReset = await Order.deleteMany({});
    const saleReset = await Sale.deleteMany({});
    const notificationReset = await Notification.deleteMany({});
    const cartReset = await User.updateMany({}, { $set: { cart: [] } });

    console.log(`Wiped: ${productReset.deletedCount} products, ${orderReset.deletedCount} orders, ${saleReset.deletedCount} sales, ${notificationReset.deletedCount} notifications.`);
    console.log(`Cleared shopping carts for ${cartReset.modifiedCount} users.`);

    // 2. Admin & Super Admin Password Update
    console.log("Securing admin accounts...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Ak@941280", salt);

    // Find and update admin
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await User.updateOne({ _id: adminUser._id }, { password: hashedPassword });
      console.log(`Successfully updated password for Admin: ${adminUser.email}`);
    } else {
      console.log("No user with role 'admin' found.");
    }

    // Find and update superadmin
    const superAdminUser = await User.findOne({ role: "superadmin" });
    if (superAdminUser) {
      await User.updateOne({ _id: superAdminUser._id }, { password: hashedPassword });
      console.log(`Successfully updated password for Super Admin: ${superAdminUser.email}`);
    } else {
      console.log("No user with role 'superadmin' found.");
    }

    console.log("Database Factory Reset and Password Update completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during Factory Reset:", error);
    process.exit(1);
  }
};

resetAndSecure();
