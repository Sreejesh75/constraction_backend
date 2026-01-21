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
  const { name, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.json({
        status: true,
        message: "User already exists",
        userId: user._id
      });
    }

    // Create new user
    user = await User.create({ name, email });

    res.json({
      status: true,
      message: "User created",
      userId: user._id
    });

  } catch (error) {
    res.json({ status: false, message: "Error", error });
  }
});

module.exports = router;
