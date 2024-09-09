const InstituteModel = require("../../model/Institute/Institute.model");
const Registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const userRegistration = asyncHandler(async (req, res) => {
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
});

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
      text: `You are receiving this because you have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://localhost:3000/reset-password/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json(new ApiError(500, err.message || "Error sending email", err));
      }
      res.status(200).json({ message: "Reset link sent to email" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err.message, err));
  }
};

// controllers/roleController.js

// Request role change
const requestRoleChange = asyncHandler(async (req, res) => {
  const { requested_Role } = req.body;
  const userId = req.user.id;

  try {
    // Validate requested role
    // Update user's role in the database
    await Registration.findByIdAndUpdate(userId, {
      requested_Role: requested_Role,
    });

    await Registration.findByIdAndUpdate(
      "66d016d594de6c052315582e", // The ID of the document you want to update
      {
        $push: {
          requests: {
            userid: userId,
            requestedRole: requested_Role,
          },
        },
      }
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, "Role change request submitted successfully.")
      );
  } catch (err) {
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err.error || "Error processing role change request.",
          err
        )
      );
  }
});

const approveRoleChange = asyncHandler(async (req, res) => {
  try {
    const { userid, approved } = req.body;
    const admin = req.user.role;
    const adminid = req.user.id;

    if (admin !== "ADMIN" && admin !== "SUPER_ADMIN") {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "You are NOT authorized to approve or deny requests."
          )
        );
    }

    const user = await Registration.findById(userid);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found."));
    }
    

    if (approved) {
      if (user.requested_Role === "INSTITUTE") {
        // Super Admin approval required for institutes
        if (admin === "SUPER_ADMIN") {
          // Find the related institute and update its verification status
          await InstituteModel.findOneAndUpdate(
            { createdBy: userid }, // Assuming that the user is an admin of the institute
            { isVerifiedBySuperAdmin: true },
            { new: true }
          );
          // Update the user's role to "INSTITUTE"
          await Registration.findByIdAndUpdate(userid, {
            role: "INSTITUTE",
            requested_Role: "",
          });
          // Update the request status to 'approved'
          await Registration.updateOne(
            { _id: adminid, "requests.userid": userid },
            { $set: { "requests.$.status": "approved" } }
          );
          return res
            .status(200)
            .json(
              new ApiResponse(
                200,
                "Institute verified and role change approved."
              )
            );
        } else {
          return res
            .status(403)
            .json(
              new ApiResponse(
                403,
                "Only SUPER_ADMIN can approve INSTITUTE roles."
              )
            );
        }
      } else {
        // For non-INSTITUTE roles, process approval by ADMIN
        await Registration.findByIdAndUpdate(userid, {
          role: user.requested_Role,
          requested_Role: "",
        });

        await Registration.updateOne(
          { _id: adminid, "requests.userid": userid },
          { $set: { "requests.$.status": "approved" } }
        );

        return res
          .status(200)
          .json(new ApiResponse(200, "Role change approved."));
      }
    } else {
      // Deny the role change request
      await Registration.findByIdAndUpdate(userid, {
        requested_Role: "",
      });

      res.status(200).json({ message: "Role change denied." });
    }
  } catch (err) {
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err.message || "Error processing approval request.",
          err
        )
      );
  }
});

const getAllRequestsByAdminId = async (req, res) => {
  const adminId = req.user.id;

  try {
    const admin = await Registration.findById(adminId, "requests");
    if (!admin) {
      (err) => {
        return res
          .status(404)
          .json(new ApiError(404, err.message || "Admin not found"));
      };
    }

    // Send back the requests
    res.status(200).json({ requests: admin.requests });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(new ApiError(500, err.message || "An error occurred", err));
  }
};

module.exports = {
  userRegistration,
  userLogin,
  forgetPassward,
  requestRoleChange,
  approveRoleChange,
  getAllRequestsByAdminId,
};
