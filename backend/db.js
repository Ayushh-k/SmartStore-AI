// backend/db.js
// Mongoose connection helper

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

/**
  Connect to MongoDB using the URI in environment variables.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Auto-verify existing accounts so they don't get locked out
    const migrationResult = await User.updateMany(
      { isVerified: { $exists: false } },
      { $set: { isVerified: true } }
    );
    if (migrationResult.modifiedCount > 0) {
      console.log(`⚡ [DB MIGRATION] Automatically verified ${migrationResult.modifiedCount} pre-existing account(s).`);
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
