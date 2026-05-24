// backend/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
  Express middleware to verify JWT and attach user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // CRITICAL CHECK: Reject undefined, null, or empty token strings
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    return res.status(401).json({ message: "Not authorized, token failed or is undefined" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account has been banned by the platform administrator." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, token failed." });
  }
};

/**
  Express middleware to verify user is an admin
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin. Access denied." });
  }
};

/**
  Express middleware to verify user is a superadmin
 */
export const superadmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as superadmin. Access denied." });
  }
};
