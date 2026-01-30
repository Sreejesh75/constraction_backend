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
    res.json({ status: false, message: "Error", error });
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

module.exports = router;
