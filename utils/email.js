const nodemailer = require("nodemailer");

// Configure your email transport using the SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'gilbert.turcotte52@ethereal.email',
      pass: 'GJbCtSeEmJFqZz7jan'
  }
});

// Function to send a success email
async function sendSuccessEmail(trainerEmail, trainerName) {
  try {
    const info = await transporter.sendMail({
      from: '"Ximbo" <orlando.howe39@ethereal.emai>', // Sender address
      to: trainerEmail, // List of receivers
      subject: "Registration Successful", // Subject line
      text: `Hello ${trainerName},\n\nYour registration was successful! Welcome to XIMBO.\n\nBest Regards,\nXimbo`, // Plain text body
      html: `<p>Hello ${trainerName},</p><p>Your registration was successful! Welcome to XIMBO.</p><p>Best Regards,<br>nXimbo</p>`, // HTML body
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendSuccessEmail };
