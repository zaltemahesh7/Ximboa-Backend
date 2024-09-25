const Institute = require("../../model/Institute/Institute.model");
const registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");
const fs = require("fs");
const { sendEmail } = require("../../utils/email");

// Controller to create an institute
// const createInstitute = async (req, res) => {
//   try {
//     const {
//       institute_name,
//       location,
//       courses,
//       establishedYear,
//       createdBy,
//       admins,
//       trainers,
//       institute_photos,
//     } = req.body;

//     const userid = req.user.id;
//     const userRole = await registration.findById(userid).select("role");

//     if (userRole === "INSTITUTE") {
//       return res
//         .status(404)
//         .json(new ApiError(404, "You are already an Institute"));
//     } else {
//       if (!institute_name) {
//         return res.status(400).json({ message: "Institute name is required" });
//       }

//       const institutePhotos = req.files
//         ? req.files.map((file) => file.path)
//         : [];

//       const newInstitute = new Institute({
//         institute_name,
//         location,
//         courses,
//         establishedYear,
//         createdBy: userid,
//         admins: admins || userid,
//         trainers: trainers || [],
//         institute_photos: institutePhotos,
//       });

//       const savedInstitute = await newInstitute.save();

//       await registration.findByIdAndUpdate(userid, {
//         requested_Role: "INSTITUTE",
//         institute: savedInstitute.id,
//       });

//       await registration.findOneAndUpdate(
//         { role: "SUPER_ADMIN" },
//         {
//           $push: {
//             requests: {
//               userid: userid,
//               requestedRole: "INSTITUTE",
//             },
//           },
//         }
//       );
//       res.status(201).json({
//         message:
//           "Institute created successfully. Awaiting super admin approval.",
//         institute: savedInstitute,
//       });
//     }
//   } catch (error) {
//     console.error("Error creating institute:", error);
//     res
//       .status(500)
//       .json(
//         new ApiError(500, error.messege || "Server Error while Login", error)
//       );
//   }
// };

/**
 * @desc Create a new institute
 * @route POST /api/institute
 * @access Private (only accessible by admins or authorized users)
 */
const createInstitute = async (req, res) => {
  try {
    const {
      institute_name,
      location,
      social_Media,
      Phone_No,
      About,
      courses,
      establishedYear,
      admins,
      trainers,
      institute_photos,
      createdBy,
    } = req.body;

    if (!institute_name || !location || !establishedYear || !createdBy) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Institute name, location, established year, and createdBy are required."
          )
        );
    }

    const newInstitute = new Institute({
      institute_name,
      location,
      social_Media: social_Media || {},
      Phone_No,
      About: About || {},
      courses: courses || [],
      establishedYear,
      createdBy,
      admins: admins || [],
      trainers: trainers || [],
      institute_photos: institute_photos || [],
    });

    const savedInstitute = await newInstitute.save();

    return res.status(201).json({
      message: "Institute created successfully",
      institute: savedInstitute,
    });
  } catch (error) {
    console.error("Error creating institute:", error);

    return res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message || "Server Error while creating institute",
          error
        )
      );
  }
};

module.exports = { createInstitute };
