const nodemailer = require("nodemailer");
const { emailTemplates } = require("../constants");
require('dotenv').config()

// Configure your email transport using the SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: "dddxjskkwtmexhga",
  },
});

// Function to send a success email
async function sendEmail(emailType, recipient, data = "") {
  try {
    const { subject, text } = emailTemplates[emailType];
    if (!subject || !text) {
      throw new Error("Invalid email type");
    }
    const info = await transporter.sendMail({
      from: `"XIMBOA" <${process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject: subject,
      text: text(recipient.name, ...data), // Passing dynamic data to template
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };
