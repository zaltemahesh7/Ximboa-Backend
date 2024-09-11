const InstituteModel = require("../../model/Institute/Institute.model");
const Registration = require("../../model/registration");
const Course = require("../../model/course"); // Course model
const Enrollment = require("../../model/Student/Enrollment"); // Enrollment model
const Product = require("../../model/product"); // Product model


const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { sendEmail } = require("../../utils/email");

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

// controllers For Role Change Request.
const requestRoleChange = asyncHandler(async (req, res) => {
  const { requested_Role } = req.body;
  const userId = req.user.id;

  try {
    // Validate the requested role
    if (!["INSTITUTE", "SELF_TRAINER", "TRAINER"].includes(requested_Role)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid role request."));
    }

    // Check if a request is already pending for the same role
    const user = await Registration.findById(userId);

    if (user.requested_Role) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Role change request is already pending."));
    }

    // Update the user's requested role in the database
    await Registration.findByIdAndUpdate(userId, {
      requested_Role: requested_Role,
    });

    const superAdmin = await Registration.findOne({ role: "SUPER_ADMIN" });
    // If the requested role is INSTITUTE or SELF_TRAINER, notify SUPER_ADMIN
    if (requested_Role === "INSTITUTE" || requested_Role === "SELF_TRAINER") {
      if (!superAdmin) {
        return res
          .status(500)
          .json(
            new ApiError(500, "No SUPER_ADMIN found to approve the request.")
          );
      }

      // Send an email notification to SUPER_ADMIN
      const userEmail = req.user.username;
      const userName = user.f_Name;

      sendEmail(
        "roleChangeRequestToSuperAdmin",
        {
          name: superAdmin.f_Name,
          email: superAdmin.email_id,
        },
        [requested_Role, userId, userEmail, userName]
      );
    }

    // Send an email to the user confirming that their request has been submitted
    sendEmail(
      "roleChangeRequestToUser", // Email template type
      {
        name: user.f_Name,
        email: user.email_id,
      }, // Recipient information
      [requested_Role] // Data to be used in the email template
    );

    // Push the request into the admin's request array
    await Registration.findByIdAndUpdate(
      superAdmin.id, // Replace with the correct admin ID or logic to find the right admin
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
    console.log(err);
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err.message || "Error processing role change request.",
          err
        )
      );
  }
});

// const approveRoleChange = asyncHandler(async (req, res) => {
//   try {
//     const { userid, approved } = req.body;
//     const requestingAdmin = req.user;

//     // Check if the requester has the appropriate role
//     if (requestingAdmin.role !== "SUPER_ADMIN") {
//       return res
//         .status(403)
//         .json(
//           new ApiResponse(
//             403,
//             "You are NOT authorized to approve or deny role change requests."
//           )
//         );
//     }

//     // Find the user whose role change is being approved/denied
//     const user = await Registration.findById(userid);
//     if (!user) {
//       return res.status(404).json(new ApiError(404, "User not found."));
//     }

//     // If approval is granted
//     if (approved) {
//       // Handle special case for "INSTITUTE" role change (only SUPER_ADMIN can approve)
//       if (user.requested_Role === "INSTITUTE") {
//         if (requestingAdmin.role !== "SUPER_ADMIN") {
//           return res
//             .status(403)
//             .json(
//               new ApiResponse(
//                 403,
//                 "Only SUPER_ADMIN can approve the INSTITUTE role."
//               )
//             );
//         }

//         // Mark the institute as verified by SUPER_ADMIN
//         await InstituteModel.findOneAndUpdate(
//           { createdBy: userid },
//           { isVerifiedBySuperAdmin: true },
//           { new: true }
//         );

//         // Update user's role to INSTITUTE
//         await Registration.findByIdAndUpdate(userid, {
//           role: "INSTITUTE",
//           requested_Role: "",
//         });

//         // Update the request status for logging purposes
//         await Registration.updateOne(
//           { _id: requestingAdmin.id, "requests.userid": userid },
//           { $set: { "requests.$.status": "approved" } }
//         );

//         return res
//           .status(200)
//           .json(
//             new ApiResponse(200, "Institute verified and role change approved.")
//           );
//       }

//       // Handle other role changes (e.g., TRAINER, SELF_TRAINER) – can be approved by either ADMIN or SUPER_ADMIN
//       await Registration.findByIdAndUpdate(userid, {
//         role: user.requested_Role,
//         requested_Role: "",
//       });

//       // Update the request status to 'approved'
//       await Registration.updateOne(
//         { _id: requestingAdmin.id, "requests.userid": userid },
//         { $set: { "requests.$.status": "approved" } }
//       );

//       return res
//         .status(200)
//         .json(new ApiResponse(200, "Role change approved."));
//     }
//     // If approval is denied
//     else {
//       // Clear the requested_Role field without changing the current role
//       await Registration.findByIdAndUpdate(userid, {
//         requested_Role: "",
//       });

//       return res.status(200).json(new ApiResponse(200, "Role change denied."));
//     }
//   } catch (err) {
//     return res
//       .status(500)
//       .json(
//         new ApiError(
//           500,
//           err.message || "Error processing role change request.",
//           err
//         )
//       );
//   }
// });

const approveRoleChange = asyncHandler(async (req, res) => {
  try {
    const { userid, approved } = req.body; // Get user ID and approval status from the request body
    const adminRole = req.user.role; // Get the role of the logged-in admin (SUPER_ADMIN)
    const adminId = req.user.id; // Get the ID of the logged-in admin

    // Ensure only SUPER_ADMIN can approve the role change requests
    if (adminRole !== "SUPER_ADMIN") {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            "You are NOT authorized to approve or deny requests."
          )
        );
    }

    // Find the user by their user ID
    const user = await Registration.findById(userid);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found."));
    }

    // Check if the user has a pending role change request
    if (!user.requested_Role) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, "No pending role change request for this user.")
        );
    }

    if (approved) {
      // If the role change is approved, update the user's role in the database
      await Registration.findByIdAndUpdate(userid, {
        role: user.requested_Role, // Set the role to the requested role
        requested_Role: "", // Clear the requested_Role after approval
      });

      // Update the request status in the requests array to 'approved'
      await Registration.updateOne(
        { _id: adminId, "requests.userid": userid },
        { $set: { "requests.$.status": "approved" } }
      );

      // Send a confirmation email to the user about their approved role change
      const approvedRole = user.requested_Role;
      sendEmail(
        "roleChangeApproved", // Template for role change approval email
        { name: user.f_Name, email: user.email_id }, // User's name and email
        [approvedRole] // Data to be used in the email template
      );

      return res
        .status(200)
        .json(new ApiResponse(200, "Role change approved successfully."));
    } else {
      // If the role change is denied, clear the user's requested_Role
      await Registration.findByIdAndUpdate(userid, {
        requested_Role: "", // Clear the requested_Role after denial
      });

      // Update the request status in the requests array to 'denied'
      await Registration.updateOne(
        { _id: adminId, "requests.userid": userid },
        { $set: { "requests.$.status": "denied" } }
      );

      // Send a denial email to the user
      const requestedRole = user.requested_Role;
      sendEmail(
        "roleChangeDenied", // Template for role change denial email
        { name: user.f_Name, email: user.email_id }, // User's name and email
        [requestedRole] // Data to be used in the email template
      );

      return res
        .status(200)
        .json(new ApiResponse(200, "Role change request denied."));
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err.message || "Error processing role change approval request.",
          err
        )
      );
  }
});

const getAllRequestsByAdminId = async (req, res) => {
  const adminId = req.user.id;

  try {
    const admin = await Registration.findById(adminId, "requests").populate({
      path: "requests.userid", // Populating the categories field
      select: "f_Name l_Name", // Selecting only the category_name from the populated categories
    })
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

// Controller to send a request to become a trainer
const requestToBecomeTrainer = asyncHandler(async (req, res) => {
  try {
    const { instituteId } = req.body; // instituteId is passed in request body
    const userId = req.user.id; // user is authenticated, and userId is available in req.user
    const userName = `${req.user.f_Name} ${req.user.l_Name}`; // User's name
    const userEmail = req.user.email_id; // User's email

    // Find the institute by ID
    const institute = await InstituteModel.findById(instituteId);
    if (!institute) {
      return res.status(404).json(new ApiError(404, "Institute not found"));
    }

    // Ensure user exists
    const user = await Registration.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    // Check if the user has already requested to become a trainer
    if (user.requested_Role === "TRAINER") {
      return res.status(400).json(new ApiError(400, "Request already pending"));
    }

    // Update the user's requested_Role field
    user.requested_Role = "TRAINER";
    await user.save();

    // Get the institute's admins (assuming the institute model has an array of admin IDs)
    const admins = await Registration.find({
      _id: { $in: institute.admins },
      role: "INSTITUTE",
    });

    if (admins.length === 0) {
      return res
        .status(404)
        .json(new ApiError(404, "No admins found for the institute"));
    }

    // Send approval requests to all admins via email
    admins.forEach(async (admin) => {
      const adminEmail = admin.email_id;
      // Use your email sending utility
      sendEmail(
        "trainerRequest",
        {
          name: "Admin",
          email: adminEmail,
        },
        [userName, institute.institute_name]
      );
    });

    res.status(200).json({
      message: "Request sent to institute admins for approval",
      requested_Role: user.requested_Role,
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Error sending request", error));
  }
});



// const Event = require("../models/Event"); // Event model
// const Booking = require("../models/Booking"); // Booking model (for event seats)

const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Total Courses created by the user (if user is a trainer/self-trainer)
    const totalCourses = await Course.countDocuments({ trainer_id: userId });

    // 2. Total Enrollments of the user (if user is a student)
    const totalEnrollments = await Enrollment.countDocuments({ userid: userId });

    // 3. Upcoming Courses for the user (courses with start date in the future)
    const upcomingCourses = await Course.countDocuments({
      trainer_id: userId,
      start_date: { $gt: new Date() }, // filter for future start dates
    });

    // 4. Total Products created by the user
    const totalProducts = await Product.countDocuments({ created_by: userId });

    // 5. Total sold products
    const totalSoldProducts = await Product.countDocuments({
      created_by: userId,
      sold: true,
    });

    // 6. Available Products (unsold)
    const availableProducts = await Product.countDocuments({
      created_by: userId,
      sold: false,
    });

    // 7. Total Events created by the user
    const totalEvents = await Event.countDocuments({ created_by: userId });

    // 8. Total booked seats in events by the user
    const totalBookedSeats = await Booking.countDocuments({
      userid: userId,
    });

    // 9. Upcoming Events (events with start date in the future)
    const upcomingEvents = await Event.countDocuments({
      created_by: userId,
      start_date: { $gt: new Date() }, // filter for future events
    });

    // Return the dashboard data
    res.status(200).json({
      totalCourses,
      totalEnrollments,
      upcomingCourses,
      totalProducts,
      totalSoldProducts,
      availableProducts,
      totalEvents,
      totalBookedSeats,
      upcomingEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching user dashboard data",
      error: error.message || "Server Error",
    });
  }
});

module.exports = { getUserDashboard };



module.exports = {
  userRegistration,
  userLogin,
  forgetPassward,
  requestRoleChange,
  requestToBecomeTrainer,
  approveRoleChange,
  getAllRequestsByAdminId,
};
