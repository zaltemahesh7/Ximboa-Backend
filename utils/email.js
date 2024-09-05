const nodemailer = require("nodemailer");

// Configure your email transport using the SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "maheshzalte2000@gmail.com",
    pass: "dddxjskkwtmexhga",
  },
});

// Function to send a success email
async function sendSuccessEmail(trainerEmail, trainerName, subject, ) {
  try {
    const info = await transporter.sendMail({
      from: '"Ximbo" <maheshzalte2000@gmail.com>', // Sender address
      to: trainerEmail, // List of receivers
      subject: "Registration Successful", // Subject line
      text: `Hello ${trainerName},\n\nYour registration was successful! Welcome to XIMBO.\n\nBest Regards,\nXimbo`, // Plain text body
      html: `<p>Hello ${trainerName},</p><p>Your registration was successful! Welcome to XIMBO.</p><p>Best Regards,<br>Ximbo</p>`, // HTML body
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendSuccessEmail };
