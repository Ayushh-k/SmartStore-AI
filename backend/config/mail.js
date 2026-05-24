// backend/config/mail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER || "ayushkamboj9690@gmail.com";
const emailPass = process.env.EMAIL_PASS || "uixdgepsnsmyysol";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

// Robust error logging on the transporter verification check
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Transporter Connection Error:", error);
  } else {
    console.log("⚡ Nodemailer Transporter is verified and ready to dispatch emails.");
  }
});
