const nodemailer = require("nodemailer");
const { emailTemplates } = require("../constants");
require("dotenv").config();

// Configure your email transport using the SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send a success email
async function sendEmail(emailType, recipient, data = "") {
  try {
    const logoUrl = "https://ximboa.io/wp-content/uploads/2024/08/xlogo.png";
    const { subject, html } = emailTemplates[emailType];
    if (!subject || !html) {
      throw new Error("Invalid email type");
    }
    const info = await transporter.sendMail({
      from: `"XIMBOA" <${process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject: subject,
      html: html(recipient.name, ...data, logoUrl),
    });
    console.log("Email sent:", info.messageId, data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };
