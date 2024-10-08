const express = require("express");
const router = express.Router();
const Registration = require("../../model/registration");
const { generateToken, jwtAuthMiddleware } = require("../../middleware/auth");
const { sendEmail } = require("../../utils/email");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const NotificationModel = require("../../model/Notifications/Notification.model");

const multer = require("multer");
const {
  forgetPassward,
  requestRoleChange,
  approveRoleChange,
  getAllRequestsByAdminId,
  // requestToBecomeTrainer,
  resetPassword,
} = require("../../controllers/Registration/registration.controller");

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

// router.post("/", upload.single("trainer_image"), async function (req, res) {
//   const {
//     f_Name,
//     middle_Name,
//     l_Name,
//     email_id,
//     password,
//     isTrainer,
//     mobile_number,
//     date_of_birth,
//     whatsapp_no,
//     rating_count,
//     address1,
//     address2,
//     city,
//     country,
//     state,
//     pincode,
//   } = req.body;

//   const trainer_image = req.file ? req.file.path : "";

//   const newRegistration = new Registration({
//     f_Name,
//     middle_Name,
//     l_Name,
//     email_id,
//     password,
//     isTrainer,
//     mobile_number,
//     trainer_image,
//     date_of_birth,
//     whatsapp_no,
//     rating_count,
//     address1,
//     address2,
//     city,
//     country,
//     state,
//     pincode,
//   });

//   // Check if user already exists
//   const existingUser = await Registration.findOne({ email_id });
//   if (existingUser) {
//     return res.status(409).json(new ApiError(409, "email_id already exists"));
//   }

//   const existingMobileNumber = await Registration.findOne({
//     mobile_number: mobile_number,
//   });
//   if (existingMobileNumber) {
//     return res
//       .status(409)
//       .json(new ApiError(409, "Mobile number is already registered"));
//   }

//   newRegistration
//     .save()
//     .then((result) => {
//       sendEmail("registrationSuccess", {
//         name: f_Name,
//         email: email_id,
//       });
//       // Generate a token
//       const payload = {
//         id: newRegistration.id,
//         role: newRegistration.role,
//         username: newRegistration.email_id,
//       };
//       const token = generateToken(payload, req);

//       res.status(200).json({ token });
//     })
//     .catch((err) => {
//       console.log(err);
//       res
//         .status(500)
//         .json(new ApiError(500, err.message || "Server Error", err));
//     });
// });

// GET route to validate user login -----------------------------------------------------------

router.post("/", upload.single("trainer_image"), async function (req, res) {
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

  try {
    // Check if user already exists by email
    const existingUser = await Registration.findOne({ email_id });
    if (existingUser) {
      return res.status(409).json(new ApiError(409, "email_id already exists"));
    }

    // Check if user already exists by mobile number
    const existingMobileNumber = await Registration.findOne({
      mobile_number: mobile_number,
    });
    if (existingMobileNumber) {
      return res
        .status(409)
        .json(new ApiError(409, "Mobile number is already registered"));
    }

    // Save the new registration
    const result = await newRegistration.save();

    // Send a registration success email
    sendEmail("registrationSuccess", {
      name: f_Name,
      email: email_id,
    });

    // Generate a token for the user
    const payload = {
      id: newRegistration.id,
      role: newRegistration.role,
      username: newRegistration.email_id,
    };
    const token = generateToken(payload, req);

    // Send notification to the trainer about successful registration
    const notification = new NotificationModel({
      recipient: result._id,
      message: `Welcome ${f_Name}, you have successfully registered.`,
      activityType: "REGISTRATION_SUCCESS",
      relatedId: result._id,
    });
    await notification.save();

    // Respond with the token
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
});

router.post("/login", async (req, res) => {
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
      role: user.role,
      username: user.email_id,
    };
    const token = generateToken(payload, req);
    sendEmail("loginSuccess", {
      name: user.f_Name,
      email: user.email_id,
    });
    const notification = new NotificationModel({
      recipient: user._id,
      message: `Welcome back ${user.f_Name} ${user.l_Name}, Login successful.`,
      activityType: "LOGIN_SUCCESS",
      relatedId: user._id,
    });
    await notification.save();
    res.status(200).json({
      token,
      profile: user.trainer_image
        ? `http://${req.headers.host}/${user.trainer_image.replace(/\\/g, "/")}`
        : "",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(new ApiError(500, err.messege || "Server Error while Login", err));
  }
});

// Update user information by user ID
router.put(
  "/update",
  jwtAuthMiddleware,
  upload.single("trainer_image"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await Registration.findById(userId);
      const {
        f_Name,
        middle_Name,
        l_Name,
        email_id,
        mobile_number,
        date_of_birth,
        whatsapp_no,
        facebook,
        instagram,
        youtube,
        linkedin,
        rating_count,
        address1,
        address2,
        city,
        country,
        state,
        pincode,
      } = req.body;

      const trainer_image = req.file ? req.file.path : undefined;

      if (!user) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }

      if (email_id && email_id !== user.email_id) {
        const existingUser = await Registration.findOne({ email_id });
        if (existingUser) {
          return res.status(400).json({ message: "Email ID already exists" });
        }
        user.email_id = email_id;
      }

      if (mobile_number && mobile_number !== user.mobile_number) {
        const existingMobileNumber = await Registration.findOne({
          mobile_number,
        });
        if (existingMobileNumber) {
          return res
            .status(409)
            .json({ message: "Mobile number is already registered" });
        }
        user.mobile_number = mobile_number;
      }

      if (f_Name) user.f_Name = f_Name;
      if (middle_Name) user.middle_Name = middle_Name;
      if (l_Name) user.l_Name = l_Name;
      if (date_of_birth) user.date_of_birth = date_of_birth;
      if (whatsapp_no) user.whatsapp_no = whatsapp_no;
      if (facebook) user.social_Media.facebook = facebook;
      if (instagram) user.social_Media.instagram = instagram;
      if (youtube) user.social_Media.youtube = youtube;
      if (linkedin) user.social_Media.linkedin = linkedin;
      if (rating_count) user.rating_count = rating_count;
      if (address1) user.address1 = address1;
      if (address2) user.address2 = address2;
      if (city) user.city = city;
      if (country) user.country = country;
      if (state) user.state = state;
      if (pincode) user.pincode = pincode;
      if (trainer_image) user.trainer_image = trainer_image;

      const updatedUser = await user.save();

      const notification = new NotificationModel({
        recipient: user._id,
        message: `Hello ${user.f_Name} ${user.l_Name}, Your Profile updated successfully :).`,
        activityType: "PROFILE_UPDATED",
        relatedId: user._id,
      });
      await notification.save();

      res.status(200).json({
        message: "User information updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error updating user information", details: error });
    }
  }
);

router.get("/email/:email_id", async (req, res) => {
  try {
    const { email_id } = req.params;
    const trainer = await Registration.findOne({ email_id });
    if (!trainer) {
      return res.status(400).json({ message: "Not Exist" });
    }
    res.status(200).json({ trainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Get all trainer ----------------------------------------------------------
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

// Get trainer by Id ----------------------------------------------------------
router.get("/trainer", jwtAuthMiddleware, function (req, res) {
  const baseUrl = req.protocol + "://" + req.get("host");

  Registration.findById(req.user.id)
    .select("-password -role -requested_Role -requests")
    .then((trainer) => {
      const result = {
        _id: trainer?._id,
        f_Name: trainer?.f_Name,
        l_Name: trainer?.l_Name,
        mobile_number: trainer?.mobile_number,
        whatsapp_no: trainer?.whatsapp_no,
        email_id: trainer?.email_id,
        date_of_birth: trainer?.date_of_birth,
        rating_count: trainer?.rating_count,
        address1: trainer?.address1,
        address2: trainer?.address2,
        city: trainer?.city,
        country: trainer?.country,
        state: trainer?.state,
        pincode: trainer?.pincode,
        categories: trainer?.categories,
        trainer_image: trainer?.trainer_image
          ? `${baseUrl}/${trainer?.trainer_image?.replace(/\\/g, "/")}`
          : "",
      };
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// POST route to reset the password
// router.post("/reset-password/:token", async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;
//   try {
//     const user = await Registration.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });
//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "Password reset token is invalid or has expired" });
//     }
//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     const notification = new NotificationModel({
//       recipient: user._id,
//       message: `Hello ${user.f_Name} ${user.l_Name}, Your Profile updated successfully :).`,
//       activityType: "PROFILE_UPDATED",
//       relatedId: user._id,
//     });
//     await notification.save();

//     res.status(200).json({ message: "Password has been reset" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err });
//   }
// });

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

router.post("/request-role-change", jwtAuthMiddleware, requestRoleChange);

router.post("/approve-role-change", jwtAuthMiddleware, approveRoleChange);

// router.post("/request-role-trainer", jwtAuthMiddleware, requestToBecomeTrainer);

// Get all Role_Change_Requests
router.get(
  "/all-rolechange-request",
  jwtAuthMiddleware,
  getAllRequestsByAdminId
);

// POST route to initiate password reset
router.post("/forget-password", forgetPassward);

// Route to handle password reset requests
router.post("/reset-password", resetPassword);

module.exports = router;
