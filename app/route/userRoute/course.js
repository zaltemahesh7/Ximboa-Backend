const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Course = require("../../../model/course");
const multer = require("multer");

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

router.get("/", (req, res, next) => {
  Course.find()
    .populate("category_id")
    .populate("trainer_id")
    .then((result) => {
      const coursesWithFullImageUrls = result.map((course) => ({
        ...course._doc,
        thumbnail_image: `http://${req.headers.host}/${course.thumbnail_image}`,
        gallary_image: `http://${req.headers.host}/${course.gallary_image}`,
        trainer_materialImage: `http://${req.headers.host}/${course.trainer_materialImage}`,
      }));
      res.status(200).json({ courses: coursesWithFullImageUrls });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// POST a new course
router.post(
  "/",
  upload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallary_image", maxCount: 1 },
    { name: "trainer_materialImage", maxCount: 1 },
  ]),
  (req, res, next) => {
    const course = new Course({
      _id: new mongoose.Types.ObjectId(),
      course_name: req.body.course_name,
      online_offline: req.body.online_offline,
      price: req.body.price,
      offer_prize: req.body.offer_prize,
      progress: req.body.progress,
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
      trainer_id: req.body.trainer_id,
    });

    course
      .save()
      .then((result) => {
        res.status(200).json({ newCourse: result });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err });
      });
  }
);

// DELETE a course by ID
router.delete("/:id", (req, res, next) => {
  Course.deleteOne({ _id: req.params.id })
    .then((result) => {
      res
        .status(200)
        .json({ msg: "Course data successfully deleted", result: result });
    })
    .catch((err) => {
      console.error(err);
      res.status500().json({ error: err });
    });
});

// UPDATE a course by ID with image upload
router.put(
  "/:id",
  upload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallary_image", maxCount: 1 },
    { name: "trainer_materialImage", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const courseId = req.params.id;

      const updatedFields = {
        course_name: req.body.course_name,
        online_offline: req.body.online_offline,
        price: req.body.price,
        offer_prize: req.body.offer_prize,
        progress: req.body.progress,
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
        trainer_id: req.body.trainer_id,
      };

      // Remove undefined fields from the update object
      Object.keys(updatedFields).forEach((key) => {
        if (updatedFields[key] === undefined) {
          delete updatedFields[key];
        }
      });

      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        updatedFields,
        { new: true }
      );

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json({ updatedCourse: updatedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
);

router.get("/:id", async (req, res, next) => {
  await Course.findById(req.params.id)
    .populate("trainer_id", "user_name")
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.status(200).json({
        course_name: result.course_name,
        thumbnail_image: `http://${req.headers.host}/${result.thumbnail_image}`,
        progress: result.progress,
        user_name: result.trainer_id.user_name,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

router.get("/BytrainerID/:trainerId", async (req, res, next) => {
  const trainerId = req.params.trainerId;

  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return res.status(400).json({
      error: "Invalid Trainer ID",
    });
  }

  await Course.find({ trainer_id: trainerId })
    .then((result) => {
      if (!result || result.length === 0) {
        return res.status(404).json({
          error: "No courses found for this trainer ID",
        });
      }
      const coursesWithFullImageUrls = result.map((course) => ({
        ...course._doc,
        thumbnail_image: `http://${req.headers.host}/${course.thumbnail_image}`,
        gallary_image: `http://${req.headers.host}/${course.gallary_image}`,
        trainer_materialImage: `http://${req.headers.host}/${course.trainer_materialImage}`,
      }));
      res.status(200).json({
        ByTrainerIdCourses: coursesWithFullImageUrls,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
