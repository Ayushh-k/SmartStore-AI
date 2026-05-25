// backend/controllers/authController.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";

/**
  Generate JWT token for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWTSECRET, {
    expiresIn: "7d",
  });
};

/**
  Returns the luxury HTML template for the OTP code.
 */
const getLuxuryOtpTemplate = (userName, otpCode) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize Your Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; border-collapse: collapse; padding: 48px; text-align: left;">
          
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 26px; font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; margin: 0; color: #000000; display: inline-block;">
                SmartStore
              </h1>
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase; color: #666666; margin-top: 8px; font-weight: 400;">
                Atelier AI Catalog
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; color: #d4af37; margin-bottom: 12px;">
                Verification Code
              </div>
              <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 22px; font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 16px 0; color: #000000; line-height: 1.3;">
                Authorize Your Account, ${userName}
              </h2>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 300; line-height: 1.6; color: #555555; margin: 0 0 32px 0;">
                Thank you for registering with SmartStore. To finalize your customer account credentials, please utilize the authorization code below. This code will expire in 5 minutes.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <div style="background-color: #fafaf9; border: 1px solid #e5e5e5; padding: 24px; display: inline-block; min-width: 200px;">
                <span style="font-family: 'Times New Roman', Times, serif; font-size: 32px; font-weight: 300; letter-spacing: 0.25em; color: #000000; display: block; padding-left: 0.25em;">
                  ${otpCode}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 40px; background-color: #fafaf9; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #999999; margin: 0 0 8px 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} SmartStore. All Rights Reserved.
              </p>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999999; margin: 0;">
                Designed with high-contrast luxury aesthetics.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
  Register a new user and generate OTP.
  Body: { name, email, password, role }
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Generate 6-digit OTP code and set 5 minutes expiration
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false,
      verificationOtp: otpCode,
      otpExpire,
    });

    // Send the OTP via our HTTPS Brevo utility
    const luxuryOtpTemplate = getLuxuryOtpTemplate(user.name, otpCode);
    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: "AUTHORIZE YOUR ACCOUNT - SMARTSTORE",
        htmlContent: luxuryOtpTemplate,
      });

      if (!emailResult) {
        throw new Error("Brevo HTTP API returned empty response status (check your BREVO_API_KEY environment variable).");
      }

      res.status(201).json({
        message: "User registered. OTP sent to email.",
        email: user.email,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeName: user.storeName,
        },
      });
    } catch (mailErr) {
      // If email fails, delete the unverified user so they can try again
      await User.findByIdAndDelete(user._id);
      console.error("Brevo Email Error:", mailErr.message);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
  Login user. Checks verification and banned status.
  Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (!captchaToken) {
      return res.status(400).json({ message: "Please complete the human verification." });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaVerify = await axios.post(verifyUrl);

    if (!captchaVerify.data.success) {
      return res.status(403).json({ message: "Bot behavior detected. CAPTCHA verification failed." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Account Suspended",
        banReason: user.banReason || "Violation of platform terms and policies.",
      });
    }

    // Intercept unverified logins
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified.",
        unverifiedEmail: user.email,
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
  Verify account via 6-digit OTP.
  Body: { email, otp }
 */
export const verifyAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified." });
    }

    if (user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (new Date() > user.otpExpire) {
      return res.status(400).json({ message: "Verification code has expired." });
    }

    // Mark user as verified and clear OTP states
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
      user: {
        id: user.id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName || "",
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
};

/**
  Resend OTP code.
  Body: { email }
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified." });
    }

    // Generate new OTP and update expire (5 min)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otpCode;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Resend email
    const luxuryOtpTemplate = getLuxuryOtpTemplate(user.name, otpCode);
    await sendEmail({
      to: user.email,
      subject: "AUTHORIZE YOUR ACCOUNT - SMARTSTORE",
      htmlContent: luxuryOtpTemplate,
    });

    res.json({
      success: true,
      message: "A new authorization code has been dispatched to your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error during resending code." });
  }
};
