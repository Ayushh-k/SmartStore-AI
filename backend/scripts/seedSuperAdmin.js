// backend/scripts/seedSuperAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGOURI;
    if (!mongoUri) {
      console.error("MONGOURI is not defined in the environment variables.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const email = "ayushkamboj9690@gmail.com";
    let devUser = await User.findOne({ email });

    if (devUser) {
      console.log(`User found. Updating role of ${email} to 'superadmin'...`);
      devUser.role = "superadmin";
      await devUser.save();
      console.log(`User role updated to 'superadmin'.`);
    } else {
      console.log(`User ${email} not found. Creating a new superadmin user...`);
      devUser = await User.create({
        name: "Ayush Kamboj",
        email,
        password: "password123", // Default password, user can change later
        role: "superadmin",
        storeName: "Developer Studio",
      });
      console.log(`New superadmin user created with default password 'password123'.`);
    }

    console.log("Checking for products without a vendor field...");
    const productsWithoutVendor = await Product.find({
      $or: [
        { vendor: { $exists: false } },
        { vendor: null },
      ],
    });

    console.log(`Found ${productsWithoutVendor.length} products without a vendor.`);

    if (productsWithoutVendor.length > 0) {
      console.log(`Assigning vendor ID ${devUser._id} to all matching products...`);
      const updateResult = await Product.updateMany(
        {
          $or: [
            { vendor: { $exists: false } },
            { vendor: null },
          ],
        },
        { $set: { vendor: devUser._id } }
      );
      console.log(`Successfully updated ${updateResult.modifiedCount} products.`);
    }

    console.log("Seeding and migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding/migration:", error);
    process.exit(1);
  }
};

seed();
