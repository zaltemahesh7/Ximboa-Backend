const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Registration = require('../../model/registration');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Import nodemailer


// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service
    auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-email-password' // Your email password
    }
});

// POST route to register a new user
router.post("/", async (req, res, next) => {
    const { user_name, mobile_number, email_id, password } = req.body;

    try {
        // Check for existing user with the same user_name
        const existingUserName = await Registration.findOne({ user_name: user_name });

        if (existingUserName) {
            return res.status(409).json({ message: 'User name is already taken' });
        }

        // Check for existing user with the same mobile_number
        const existingMobileNumber = await Registration.findOne({ mobile_number: mobile_number });
        if (existingMobileNumber) {
            return res.status(409).json({ message: 'Mobile number is already registered' });
        }

        // Check for existing user with the same email_id
        const existingEmailId = await Registration.findOne({ email_id: email_id });
        if (existingEmailId) {
            return res.status(409).json({ message: 'Email ID is already registered' });
        }

        // Check for existing user with the same password
        const existingPassword = await Registration.findOne({ password: password });
        if (existingPassword) {
            return res.status(409).json({ message: 'Password is already used' });
        }

        // Create a new registration if all checks pass
        const register = new Registration({
            _id: new mongoose.Types.ObjectId(),
            user_name: user_name,
            mobile_number: mobile_number,
            email_id: email_id,
            password: password
        });

        const result = await register.save();
        res.status(200).json({ newRegister: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

// GET route to validate user login
router.get("/login", async (req, res, next) => {
    const { user_name, password } = req.query;

    try {
        const user = await Registration.findOne({ user_name: user_name, password: password });
        if (user) {
            return res.status(200).json({ message: 'Login successful' });
        } else {
            return res.status(401).json({ message: 'Invalid user name or password' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

// POST route to initiate password reset
router.post("/forget-password", async (req, res) => {
    const { email_id } = req.body;

    try {
        const user = await Registration.findOne({ email_id: email_id });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;

        await user.save();

        // Send email with the reset token
        const mailOptions = {
            to: email_id,
            from: '',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://localhost:3000/reset-password/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.status(200).json({ message: 'Reset link sent to email' });
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
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset' });
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
