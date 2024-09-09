const Institute = require("../../model/Institute/Institute.model");
const registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");
const fs = require("fs");
const { sendEmail } = require("../../utils/email");

// Controller to create an institute
const createInstitute = async (req, res) => {
  try {
    const { institute_name, admins, trainers } = req.body;

    // Get the current admin (assuming you're using a token-based authentication)
    const userid = req.user.id;
    const userRole = await registration.findById(userid).select("role");

    if (userRole === "INSTITUTE") {
      return res
        .status(404)
        .json(new ApiError(404, "You are already an Institute"));
    } else {
      // Validate input
      if (!institute_name) {
        return res.status(400).json({ message: "Institute name is required" });
      }

      // Collect uploaded photos
      const institutePhotos = req.files
        ? req.files.map((file) => file.path)
        : [];

      // Create the institute
      const newInstitute = new Institute({
        institute_name,
        createdBy: userid,
        updatedBy: userid,
        admins: admins || userid, // Add any provided admins
        trainers: trainers || [], // Add any provided trainers
        institute_photos: institutePhotos, // Add the photo paths
      });

      // Save the institute
      const savedInstitute = await newInstitute.save();

      // Validate requested role
      // Update user's role in the database
      await registration.findByIdAndUpdate(userid, {
        requested_Role: "INSTITUTE",
        institute: savedInstitute.id,
      });

      await registration.findByIdAndUpdate("66cd6fcb183630e08a2214f1", {
        $push: {
          requests: {
            userid: userid,
            requestedRole: "INSTITUTE",
          },
        },
      });
      // Respond with success message
      res.status(201).json({
        message:
          "Institute created successfully. Awaiting super admin approval.",
        institute: savedInstitute,
      });
    }
  } catch (error) {
    console.error("Error creating institute:", error);
    res
      .status(500)
      .json(
        new ApiError(500, error.messege || "Server Error while Login", error)
      );
  }
};

module.exports = { createInstitute };
