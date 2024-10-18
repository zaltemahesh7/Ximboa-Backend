const express = require("express");
const Enrollment = require("../../../model/Student/Enrollment");
const Course = require("../../../model/course");
const { jwtAuthMiddleware } = require("../../../middleware/auth");
const { ApiError } = require("../../../utils/ApiError");
const Registration = require("../../../model/registration");
const { sendEmail } = require("../../../utils/email");
const NotificationModel = require("../../../model/Notifications/Notification.model");

const router = express.Router();

// POST route to enroll in a course
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const { course_id } = req.body;
    const userid = req.user.id;

    // Check if the course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get trainer details based on the trainer_id from the course
    const trainer_data = await Registration.findById(course.trainer_id).select(
      "email_id f_Name"
    );

    if (!trainer_data) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Check if the student exists
    const student = await Registration.findById(userid).select(
      "f_Name email_id"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({
      userid,
      course_id,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Student is already enrolled in this course" });
    }

    // Create a new enrollment
    const enrollment = new Enrollment({
      userid,
      course_id,
    });

    const result = await enrollment.save();

    // Send email to student after successful enrollment
    const courseName = course.course_name;
    sendEmail(
      "enrollment",
      {
        name: student.f_Name,
        email: student.email_id,
      },
      [courseName]
    );

    // Create notification for the student
    const studentNotification = new NotificationModel({
      recipient: userid,
      message: `You have successfully enrolled in the course: ${course.course_name}`,
      activityType: "COURSE_ENROLLMENT",
      relatedId: course._id,
    });
    await studentNotification.save();

    // Create notification for the trainer
    const trainerNotification = new NotificationModel({
      recipient: course.trainer_id,
      message: `A student has enrolled in your course: ${course.course_name}`,
      activityType: "COURSE_ENROLLMENT",
      relatedId: course._id,
    });
    await trainerNotification.save();

    // Send email to the trainer notifying about the new student enrollment
    const trainerName = trainer_data.f_Name;
    const studentName = student.f_Name;
    sendEmail(
      "enrollmentNotificationToTrainer",
      {
        name: trainer_data.f_Name,
        email: trainer_data.email_id,
      },
      [trainerName, studentName, courseName]
    );

    // Return success response with enrollment details
    res
      .status(201)
      .json({ message: "Enrollment successful", enrollment: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

router.get("/", async (req, res) => {
  try {
    const enrollment = await Enrollment.find();
    res.status(200).json(enrollment);
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(500, error.message || "Error fetching enrollments", error)
      );
  }
});

// router.get("/student", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const baseUrl = req.protocol + "://" + req.get("host");
//     const enrollment = await Enrollment.find({
//       userid: req.user.id,
//     }).populate("course_id", "course_name thumbnail_image");
//     if (enrollment.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No enrollments found for this student" });
//     }
//     const enrollments = enrollment.map((course) => {
//       return {
//         ...course._doc,
//         course_thumbnail: course.course_id?.thumbnail_image
//           ? `${baseUrl}/${course.course_id.thumbnail_image.replace(/\\/g, "/")}`
//           : "",
//       };
//     });

//     res.status(200).json(enrollments);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json(
//         new ApiError(500, error.message || "Error fetching enrollments", error)
//       );
//   }
// });

// router.get("/student", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const baseUrl = req.protocol + "://" + req.get("host");

//     // Find all enrollments for the logged-in student
//     const enrollment = await Enrollment.find({
//       userid: req.user.id,
//     }).populate("course_id", "course_name thumbnail_image");

//     if (enrollment.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No enrollments found for this student" });
//     }

//     // Process all enrollments in parallel using Promise.all
//     const enrollments = await Promise.all(
//       enrollment.map(async (course1) => {
//         const course = await Course.findById(course1.course_id._id)
//           .populate("category_id", "category_name")
//           .populate("trainer_id", "f_Name l_Name trainer_image id city role");

//         return {
//           _id: course?._id,
//           category_name: course?.category_id?.category_name || "",
//           course_name: course?.course_name || "",
//           online_offline: course?.online_offline || "",
//           thumbnail_image: course?.thumbnail_image
//             ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
//             : "",
//           trainer_image: course?.trainer_id?.trainer_image
//             ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
//                 /\\/g,
//                 "/"
//               )}`
//             : "",
//           trainer_id: course?.trainer_id?._id,
//           business_Name: course?.trainer_id?.business_Name
//             ? course?.trainer_id?.business_Name
//             : `${course?.trainer_id?.f_Name || ""} ${
//                 course?.trainer_id?.l_Name || ""
//               }`.trim() || "",
//           course_rating: "",
//           course_duration: Math.floor(
//             Math.round(
//               ((course?.end_date - course?.start_date) /
//                 (1000 * 60 * 60 * 24 * 7)) *
//                 100
//             ) / 100
//           ),
//           course_price: course?.price || "",
//           course_offer_prize: course?.offer_prize || "",
//           course_flag:
//             course?.trainer_id?.role === "TRAINER"
//               ? "Institute"
//               : "Self Expert",
//         };
//       })
//     );

//     // Send the processed enrollment data
//     res.status(200).json(enrollments);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: error.message || "Error fetching enrollments",
//       error,
//     });
//   }
// });


const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // Cache data for 1 hour

router.get("/student", jwtAuthMiddleware, async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");

    // Check if enrollments are already cached for this user
    const cacheKey = `enrollments_${req.user.id}`;
    let enrollments = cache.get(cacheKey);

    // If not in cache, fetch from database
    if (!enrollments) {
      // Find all enrollments for the logged-in student with necessary population
      const enrollment = await Enrollment.find({
        userid: req.user.id,
      })
        .populate({
          path: "course_id",
          select: "course_name thumbnail_image online_offline price offer_prize start_date end_date",
          populate: [
            { path: "category_id", select: "category_name" },
            { path: "trainer_id", select: "f_Name l_Name trainer_image business_Name role city" },
          ],
        });

      if (enrollment.length === 0) {
        return res
          .status(404)
          .json({ message: "No enrollments found for this student" });
      }

      // Process all enrollments
      enrollments = enrollment.map((course1) => {
        const course = course1.course_id;
        return {
          _id: course._id,
          category_name: course?.category_id?.category_name || "",
          course_name: course?.course_name || "",
          online_offline: course?.online_offline || "",
          thumbnail_image: course?.thumbnail_image
            ? `${baseUrl}/${course?.thumbnail_image.replace(/\\/g, "/")}`
            : "",
          trainer_image: course?.trainer_id?.trainer_image
            ? `${baseUrl}/${course?.trainer_id?.trainer_image.replace(/\\/g, "/")}`
            : "",
          trainer_id: course?.trainer_id?._id,
          business_Name: course?.trainer_id?.business_Name
            ? course?.trainer_id?.business_Name
            : `${course?.trainer_id?.f_Name || ""} ${course?.trainer_id?.l_Name || ""}`.trim() || "",
          course_rating: "", // Add logic to calculate course rating if needed
          course_duration: Math.round(
            (new Date(course?.end_date) - new Date(course?.start_date)) /
              (1000 * 60 * 60 * 24 * 7) // Duration in weeks
          ),
          course_price: course?.price || "",
          course_offer_prize: course?.offer_prize || "",
          course_flag:
            course?.trainer_id?.role === "TRAINER" ? "Institute" : "Self Expert",
        };
      });

      // Cache the processed data
      cache.set(cacheKey, enrollments);
    }

    // Send the processed enrollment data (from cache or DB)
    res.status(200).json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Error fetching enrollments",
      error,
    });
  }
});




router.get("/course/:course_id", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course_id: req.params.course_id,
    });
    if (enrollments.length === 0) {
      return res
        .status(404)
        .send({ message: "No enrollments found for this course" });
    }
    res.status(200).send(enrollments);
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(500, error.message || "Error fetching enrollments", error)
      );
  }
});

module.exports = router;
