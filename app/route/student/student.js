// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../../../model/Student/Student"); // Assuming User model is in models directory
// const {
//   jwtAuthMiddleware,
//   generateToken,
// } = require("../../../middleware/auth"); // Middleware for protected routes

// const router = express.Router();

// // Register a new user
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, ...rest } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = new User({ name, email, password, ...rest });
//     await user.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

// // Login user
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Generate a token
//     const payload = {
//       id: user.id,
//       username: user.email,
//     };
//     const token = generateToken(payload);
//     res.status(200).json({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

// // Logout user (invalidate token)
// router.post("/logout", (req, res) => {
//   res.status(200).json({ message: "User logged out successfully" });
// });

// // Password reset request
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "Password reset email sent" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

// // Password reset confirmation
// router.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     // Verify reset token (pseudo-code)
//     // const userId = verifyResetToken(token);

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.password = password;
//     await user.save();

//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

// module.exports = router;
