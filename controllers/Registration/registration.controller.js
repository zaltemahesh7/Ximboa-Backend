const Registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");

const UserRegistration = async (req, res) => {
  const {
    f_Name,
    middle_Name,
    l_Name,
    email_id,
    password,
    isTrainer,
    mobile_number,
    date_of_birth,
    whatsapp_no,
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
    f_Name,
    middle_Name,
    l_Name,
    email_id,
    password,
    isTrainer,
    mobile_number,
    trainer_image,
    date_of_birth,
    whatsapp_no,
    rating_count,
    address1,
    address2,
    city,
    country,
    state,
    pincode,
  });

  // Check if user already exists
  const existingUser = await Registration.findOne({ email_id });
  if (existingUser) {
    return res.status(409).json(new ApiError(409, "email_id already exists"));
  }

  const existingMobileNumber = await Registration.findOne({
    mobile_number: mobile_number,
  });
  if (existingMobileNumber) {
    return res
      .status(409)
      .json(new ApiError(409, "Mobile number is already registered"));
  }

  newRegistration
    .save()
    .then((result) => {
      sendSuccessEmail(email_id, f_Name);
      res
        .status(200)
        .json(new ApiResponse(200, "Registration Success", result.f_Name));
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json(new ApiError(500, err.message || "Server Error", err));
    });
};

// GET route to validate user login ----------------------------------------------------------------
const userLogin = async (req, res) => {
  try {
    const { email_id, password } = req.body;
    const user = await Registration.findOne({ email_id });
    if (!user) {
      return res
      .status(400)
        .json(new ApiError(400, "Invalid email or password"));
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
        .status(400)
        .json(new ApiError(400, "Invalid email or password"));
      }
      // Generate a token
      const payload = {
        id: user.id,
        username: user.email_id,
      };
      const token = generateToken(payload, req);
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  };
  
  
  // Forget Passward controller ----------------------------------------------------------------
  const forgetPassward = async (req, res) => {
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
}

module.exports = { UserRegistration, userLogin, forgetPassward };