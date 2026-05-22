// backend/db.js
// Mongoose connection helper

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
  Connect to MongoDB using the URI in environment variables.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
