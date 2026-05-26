// backend/emergencyFix.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";

dotenv.config();

const patchPasswords = async () => {
  try {
    const mongoUri = process.env.MONGOURI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGOURI or MONGO_URI is not defined in the environment variables.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    // PLACEHOLDER: Change this email if needed before running!
    const superAdminEmail = "ayushkamboj9690@gmail.com"; 

    // 1. Secure Super Admin
    console.log(`Locating Super Admin with email: ${superAdminEmail}...`);
    const superAdmin = await User.findOne({ email: superAdminEmail });
    if (superAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Ak@941280", salt);
      await User.updateOne({ _id: superAdmin._id }, { password: hashedPassword });
      console.log(`Successfully patched Super Admin (${superAdminEmail}) password.`);
    } else {
      console.log(`Warning: Super Admin with email ${superAdminEmail} was not found in the database.`);
    }

    // 2. Reset other Admin / Vendor accounts
    console.log("Resetting temporary passwords for other admins/vendors...");
    const saltOther = await bcrypt.genSalt(10);
    const hashedOtherPassword = await bcrypt.hash("Vendor@123", saltOther);

    // Update other users who are 'admin' or 'vendor' role
    const updateResult = await User.updateMany(
      {
        email: { $ne: superAdminEmail },
        role: { $in: ["admin", "vendor"] },
      },
      {
        $set: { password: hashedOtherPassword }
      }
    );

    console.log(`Successfully reset temporary passwords for ${updateResult.modifiedCount} other vendor/admin accounts.`);
    console.log("Emergency password recovery patch completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during Emergency Password Patch:", error);
    process.exit(1);
  }
};

patchPasswords();
