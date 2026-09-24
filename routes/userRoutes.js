const express = require("express");
const router = express.Router();
const User = require("../models/user");
/**
 * @swagger
 * /api/create-user:
 *   post:
 *     summary: Create or return existing user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sreejesh
 *               email:
 *                 type: string
 *                 example: sreejesh@gmail.com
 *     responses:
 *       200:
 *         description: User created or already exists
 */


// Create or return existing user
router.post("/create-user", async (req, res) => {
  let { name, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.json({
        status: true,
        message: "User already exists",
        userId: user._id,
        name: user.name
      });
    }

    // If name is not provided, use the part of email before @
    if (!name) {
      name = email.split('@')[0];
    }

    // Create new user
    user = await User.create({ name, email });

    res.json({
      status: true,
      message: "User created",
      userId: user._id,
      name: user.name
    });

  } catch (error) {
    console.error("Create User Error:", error);
    res.json({ status: false, message: "Error", error: error.message || error.toString() });
  }
});

/**
 * @swagger
 * /api/update-name:
 *   post:
 *     summary: Update user name
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *             properties:
 *               userId:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Name updated successfully
 */
router.post("/update-name", async (req, res) => {
  const { userId, name } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true } // Return updated document
    );

    if (!user) {
      return res.json({
        status: false,
        message: "User not found"
      });
    }

    res.json({
      status: true,
      message: "Name updated successfully",
      user
    });

  } catch (error) {
    res.json({ status: false, message: "Error updating name", error });
  }
});

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: User logout
 *     tags:
 *       - User
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", async (req, res) => {
  try {
    // Since we are using stateless JWT/session (or just client-side storage),
    // this endpoint mainly serves as a confirmation for the client to clear local state.
    // If we had a token blacklist or server-side sessions, we would handle invalidation here.

    res.json({
      status: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.json({ status: false, message: "Error logging out", error });
  }
});

/**
 * @swagger
 * /api/send-otp:
 *   post:
 *     summary: Send 4-digit OTP valid for 2 minutes to user mobile number
 *     tags:
 *       - User Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               name:
 *                 type: string
 *                 example: "Sreejesh"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/send-otp", async (req, res) => {
  const { phone, name } = req.body;

  if (!phone) {
    return res.json({ status: false, message: "Phone number is required" });
  }

  const cleanPhone = phone.toString().trim();

  try {
    // Generate 4-digit OTP (1000 - 9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // OTP expires in 2 minutes (120,000 ms)
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      user = new User({
        phone: cleanPhone,
        name: name || `User_${cleanPhone.slice(-4)}`
      });
    } else if (name && !user.name) {
      user.name = name;
    }

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log(`[OTP SENT] Phone: ${cleanPhone} | OTP: ${otp} | ExpiresAt: ${otpExpiresAt.toISOString()}`);

    res.json({
      status: true,
      message: "OTP sent successfully. Valid for 2 minutes.",
      phone: cleanPhone,
      otp, // Included for development/testing
      otpExpiresAt
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.json({ status: false, message: "Error sending OTP", error: error.message || error.toString() });
  }
});

/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     summary: Verify 4-digit OTP for user mobile number
 *     tags:
 *       - User Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.json({ status: false, message: "Phone number and OTP are required" });
  }

  const cleanPhone = phone.toString().trim();
  const cleanOtp = otp.toString().trim();

  try {
    const user = await User.findOne({ phone: cleanPhone });

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.json({ status: false, message: "No active OTP request found for this phone number" });
    }

    // Check if OTP has expired (2 minute validity limit)
    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.json({ status: false, message: "OTP has expired. Please request a new OTP." });
    }

    // Check if OTP matches
    if (user.otp !== cleanOtp) {
      return res.json({ status: false, message: "Invalid OTP. Please check and try again." });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({
      status: true,
      message: "OTP verified successfully",
      userId: user._id,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.json({ status: false, message: "Error verifying OTP", error: error.message || error.toString() });
  }
});

module.exports = router;
