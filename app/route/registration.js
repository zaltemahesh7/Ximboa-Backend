const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const Registration = require("../../model/registration");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // Import nodemailer

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: "your-email@gmail.com", // Your email
    pass: "your-email-password", // Your email password
  },
});

const multer = require("multer");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

// Create a new trainer
// Register a new user----------------------------------------------------------

router.post(
  "/",
  upload.single("trainer_image"),
  async function (req, res, next) {
    const {
      user_name,
      email_id,
      password,
      mobile_number,
      date_of_birth,
      rating,
      rating_count,
      address1,
      address2,
      city,
      country,
      state,
      pincode,
    } = req.body;

    const trainer_image = req.file ? req.file.path : "";

    const newRegistration = new Registration({
      user_name,
      email_id,
      password,
      mobile_number,
      trainer_image,
      date_of_birth,
      rating,
      rating_count,
      address1,
      address2,
      city,
      country,
      state,
      pincode,
    });

    const existingUserName = await Registration.findOne({
      user_name: user_name,
    });

    if (existingUserName) {
      return res.status(409).json({ message: "User name is already taken" });
    }

    const existingMobileNumber = await Registration.findOne({
      mobile_number: mobile_number,
    });
    if (existingMobileNumber) {
      return res
        .status(409)
        .json({ message: "Mobile number is already registered" });
    }

    // Check if user already exists
    const existingUser = await Registration.findOne({ email_id });
    if (existingUser) {
      return res.status(400).json({ message: "email_id already exists" });
    }

    newRegistration
      .save()
      .then((result) => {
        res.status(200).json({
          newTrainer: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);

// Get app user----------------------------------------------------------

router.get("/", function (req, res) {
  Registration.find()
    .then((result) => {
      res.status(200).json({
        allRegistration: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// GET route to validate user login ----------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email_id, password } = req.body;

    const user = await Registration.findOne({ email_id });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, "bhojsoft", { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// POST route to initiate password reset
router.post("/forget-password", async (req, res) => {
  const { email_id } = req.body;

  try {
    const user = await Registration.findOne({ email_id: email_id });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;

    await user.save();

    // Send email with the reset token
    const mailOptions = {
      to: email_id,
      from: "",
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://localhost:3000/reset-password/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Reset link sent to email" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// POST route to reset the password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await Registration.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// POST route to logout user
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to logout" });
    } else {
      return res.status(200).json({ message: "Logout successful" });
    }
  });
});

module.exports = router;
