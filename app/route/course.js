const express = require("express");
const router = express.Router();
const Course = require("../../model/course");
const multer = require("multer");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const registration = require("../../model/registration");
const NotificationModel = require("../../model/Notifications/Notification.model");

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
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

router.get("/", async (req, res, next) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    // Get page and limit from query parameters with default values
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 4; // Default to 10 courses per page

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch courses with pagination, populate category and trainer, and apply limit and skip
    const courses = await Course.find()
      .populate("category_id")
      .populate("trainer_id", "f_Name l_Name")
      .limit(limit)
      .skip(skip);

    // Format the course data to include full image URLs
    const coursesWithFullImageUrls = courses.map((course) => ({
      ...course._doc,
      thumbnail_image: `http://${req.headers.host}/${course.thumbnail_image}`,
      gallary_image: `http://${req.headers.host}/${course.gallary_image}`,
      trainer_materialImage: `http://${req.headers.host}/${course.trainer_materialImage}`,
    }));

    // Get total count of courses to calculate total pages
    const totalCourses = await Course.countDocuments();
    const totalPages = Math.ceil(totalCourses / limit);

    // Send response with courses and pagination info
    res.status(200).json({
      courses: coursesWithFullImageUrls,
      currentPage: page,
      totalPages,
      totalCourses,
    });
  } catch (err) {
    // console.error(err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
});

// POST a new course
// router.post(
//   "/",
//   upload.fields([
//     { name: "thumbnail_image", maxCount: 1 },
//     { name: "gallary_image", maxCount: 1 },
//     { name: "trainer_materialImage", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const course = new Course({
//       course_name: req.body.course_name,
//       online_offline: req.body.online_offline,
//       price: req.body.price,
//       offer_prize: req.body.offer_prize,
//       start_date: req.body.start_date,
//       end_date: req.body.end_date,
//       start_time: req.body.start_time,
//       end_time: req.body.end_time,
//       course_information: req.body.course_information,
//       thumbnail_image: req.files["thumbnail_image"]
//         ? req.files["thumbnail_image"][0].path
//         : "",
//       gallary_image: req.files["gallary_image"]
//         ? req.files["gallary_image"][0].path
//         : "",
//       trainer_materialImage: req.files["trainer_materialImage"]
//         ? req.files["trainer_materialImage"][0].path
//         : "",
//       category_id: req.body.category_id,
//       trainer_id: req.user.id, // Fetch Trainer ID from token payload
//     });

//     try {
//       // Save the course
//       const savedCourse = await course.save();

//       // Check if the category_id is already in the trainer's categories array
//       await registration.findByIdAndUpdate(
//         req.user.id, // Trainer ID
//         { $addToSet: { categories: req.body.category_id } }, // Only add if it doesn't exist
//         { new: true } // Return the updated document
//       );

//       res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             "Course Added Successfully",
//             savedCourse.course_name
//           )
//         );
//     } catch (err) {
//       console.error(err);
//       res
//         .status(500)
//         .json(new ApiError(500, err.message || "Server Error", err));
//     }
//   }
// );

router.post(
  "/",
  upload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallary_image", maxCount: 1 },
    { name: "trainer_materialImage", maxCount: 1 },
  ]),
  async (req, res) => {
    const course = new Course({
      course_name: req.body.course_name,
      online_offline: req.body.online_offline,
      price: req.body.price,
      offer_prize: req.body.offer_prize,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      course_information: req.body.course_information,
      thumbnail_image: req.files["thumbnail_image"]
        ? req.files["thumbnail_image"][0].path
        : "",
      gallary_image: req.files["gallary_image"]
        ? req.files["gallary_image"][0].path
        : "",
      trainer_materialImage: req.files["trainer_materialImage"]
        ? req.files["trainer_materialImage"][0].path
        : "",
      category_id: req.body.category_id,
      trainer_id: req.user.id, // Fetch Trainer ID from token payload
    });

    try {
      // Save the course
      const savedCourse = await course.save();

      // Notify the trainer about the new course
      const notification = new NotificationModel({
        recipient: req.user.id, // Trainer ID
        message: `Your course "${savedCourse.course_name}" has been created successfully.`,
        activityType: "COURSE_CREATE",
        relatedId: savedCourse._id,
      });
      await notification.save();

      // (Optional) Notify users who follow the trainer about the new course (add custom logic to find such users)

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Course Added Successfully",
            savedCourse.course_name
          )
        );
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json(new ApiError(500, err.message || "Server Error", err));
    }
  }
);

// ========================= course/:id ====================================
router.get("/:id", (req, res, next) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  Course.find({ _id: req.params.id })
    .populate("category_id", "category_name -_id")
    .populate("trainer_id", "f_Name l_Name")
    .then((result) => {
      const coursesWithFullImageUrls = result.map((course) => ({
        ...course._doc,
        category_id: course.category_id.category_name,
        thumbnail_image: `http://${
          req.headers.host
        }/${course.thumbnail_image.replace(/\\/g, "/")}`,

        gallary_image: `http://${
          req.headers.host
        }/${course.gallary_image.replace(/\\/g, "/")}`,
        trainer_materialImage: `http://${
          req.headers.host
        }/${course.trainer_materialImage.replace(/\\/g, "/")}`,
      }));
      // console.log(coursesWithFullImageUrls),
      res.status(200).json(coursesWithFullImageUrls[0]);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json(new ApiError(500, err.message || "Server Error", err));
    });
});

// router.put(
//   "/:id",
//   upload.fields([
//     { name: "thumbnail_image", maxCount: 1 },
//     { name: "gallary_image", maxCount: 1 },
//     { name: "trainer_materialImage", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const courseId = req.params.id;
//     const updateData = {
//       course_name: req.body.course_name,
//       online_offline: req.body.online_offline,
//       price: req.body.price,
//       offer_prize: req.body.offer_prize,
//       start_date: req.body.start_date,
//       end_date: req.body.end_date,
//       start_time: req.body.start_time,
//       end_time: req.body.end_time,
//       course_information: req.body.course_information,
//       thumbnail_image: req.files["thumbnail_image"]
//         ? req.files["thumbnail_image"][0].path
//         : undefined, // Use undefined to avoid setting empty string if no file uploaded
//       gallary_image: req.files["gallary_image"]
//         ? req.files["gallary_image"][0].path
//         : undefined,
//       trainer_materialImage: req.files["trainer_materialImage"]
//         ? req.files["trainer_materialImage"][0].path
//         : undefined,
//       category_id: req.body.category_id,
//       trainer_id: req.user.id, // Assuming trainer ID is fetched from the token payload
//     };

//     try {
//       // Find the course by ID and update with the new data
//       const updatedCourse = await Course.findByIdAndUpdate(
//         courseId,
//         updateData,
//         {
//           new: true, // Return the updated document
//           runValidators: true, // Run schema validation on updates
//         }
//       );

//       if (!updatedCourse) {
//         return res.status(404).json(new ApiError(404, "Course not found"));
//       }

//       const attendees = updatedEvent.registered_users;
//       // Create notifications for each attendee
//       const notifications = attendees.map((attendee) => {
//         return {
//           recipient: attendee._id,
//           message: `The course "${updatedCourse.course_name}" has been updated`,
//           activityType: "COURSE_UPDATE",
//           relatedId: updatedCourse._id,
//         };
//       });
//       await NotificationModel.insertMany(notifications);

//       res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             "Course updated successfully",
//             updatedCourse.course_name
//           )
//         );
//     } catch (err) {
//       console.error(err);
//       res
//         .status(500)
//         .json(new ApiError(500, err.message || "Server Error", err));
//     }
//   }
// );

// DELETE a course by ID

router.put(
  "/:id",
  upload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallary_image", maxCount: 1 },
    { name: "trainer_materialImage", maxCount: 1 },
  ]),
  async (req, res) => {
    const courseId = req.params.id;
    const updateData = {
      course_name: req.body.course_name,
      online_offline: req.body.online_offline,
      price: req.body.price,
      offer_prize: req.body.offer_prize,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      course_information: req.body.course_information,
      thumbnail_image: req.files["thumbnail_image"]
        ? req.files["thumbnail_image"][0].path
        : undefined,
      gallary_image: req.files["gallary_image"]
        ? req.files["gallary_image"][0].path
        : undefined,
      trainer_materialImage: req.files["trainer_materialImage"]
        ? req.files["trainer_materialImage"][0].path
        : undefined,
      category_id: req.body.category_id,
      trainer_id: req.user.id,
    };

    try {
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedCourse) {
        return res.status(404).json(new ApiError(404, "Course not found"));
      }

      const notification = new NotificationModel({
        recipient: req.user.id,
        message: `Your course "${updatedCourse.course_name}" has been updated successfully.`,
        activityType: "COURSE_UPDATE",
        relatedId: updatedCourse._id,
      });

      await notification.save();

      const attendees = updatedCourse.registered_users;

      if (attendees) {
        const notifications = attendees?.map((attendee) => ({
          recipient: attendee,
          message: `The course "${updatedCourse.course_name}" has been updated.`,
          activityType: "COURSE_UPDATE",
          relatedId: updatedCourse._id,
        }));
        await NotificationModel.insertMany(notifications);
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, "Course updated successfully", updatedCourse)
        );
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json(new ApiError(500, err.message || "Server Error", err));
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const data = await Course.deleteOne({ _id: req.params.id });
    if (!data.deletedCount) res.status(400).json({ msg: "Not Found" });
    else {
      res
        .status(200)
        .json({ msg: "Course data successfully deleted", result: data });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json(new ApiError(404, "Course not found"));
    }

    await Course.deleteOne({ _id: req.params.id });

    const attendees = course.registered_users;

    const notifications = attendees.map((attendee) => ({
      recipient: attendee,
      message: `The course "${course.course_name}" has been deleted.`,
      notificationType: "COURSE_DELETE",
      course: course._id,
    }));
    await notifications.save();

    const notification = new NotificationModel({
      recipient: req.user.id,
      message: `Your course "${deletedCourse.course_name}" has been deleted successfully.`,
      activityType: "COURSE_DELETE",
      relatedId: deletedCourse._id,
    });

    await notification.save();

    res.status(200).json({
      message: "Course deleted successfully and notifications sent.",
    });
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message || "Server Error"));
  }
});

router.get("/trainer", async (req, res) => {
  const { trainerId } = req.user.id;
  console.log(trainerId);

  if (!trainerId) res.send("No courses");
  try {
    // Fetch courses by trainer_id
    const courses = await Course.find({ trainer_id: trainerId })
      .populate("category_id", "category_name -_id")
      .populate("trainer_id", "f_Name l_Name -_id");

    // Map the courses to include full image URLs
    const coursesWithFullImageUrls = courses.map((course) => ({
      ...course._doc,
      thumbnail_image: `http://${
        req.headers.host
      }/${course.thumbnail_image.replace(/\\/g, "/")}`,
      gallary_image: `http://${req.headers.host}/${course.gallary_image.replace(
        /\\/g,
        "/"
      )}`,
      trainer_materialImage: `http://${
        req.headers.host
      }/${course.trainer_materialImage.replace(/\\/g, "/")}`,
    }));

    // Send response with courses data
    res.status(200).json(coursesWithFullImageUrls);
  } catch (err) {
    // console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message || "An error occurred while fetching courses.",
    });
  }
});

module.exports = router;
