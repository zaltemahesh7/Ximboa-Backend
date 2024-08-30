const express = require("express");
const router = express.Router();
const Course = require("../../model/course");
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
      // console.log(coursesWithFullImageUrls),
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
  (req, res) => {
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
      trainer_id: req.user.id, // Don't pass Trainer id it will fetched from token payload
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

// ========================= course/:id ====================================
router.get("/:id", (req, res, next) => {
  Course.find({ _id: req.params.id })
    .populate("category_id", "category_name -_id")
    .select("-trainer_id")
    .then((result) => {
      const coursesWithFullImageUrls = result.map((course) => ({
        ...course._doc,
        category_id: course.category_id.category_name,
        thumbnail_image: `http://${req.headers.host}/${course.thumbnail_image}`,

        gallary_image: `http://${req.headers.host}/${course.gallary_image}`,
        trainer_materialImage: `http://${req.headers.host}/${course.trainer_materialImage}`,
      }));
      // console.log(coursesWithFullImageUrls),
      res.status(200).json(coursesWithFullImageUrls[0]);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// DELETE a course by ID
router.delete("/:id", async (req, res, next) => {
  try {
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

// dto
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
        trainer_id: req.user.id, // Don't pass Trainer id it will fetched from token payload
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

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({ trainer_id: req.user.id });
    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.get("/", async (req, res) => {
  const result = await Course.findById(req.params.id);
  // .populate("trainer_id")

  if (!result) return res.status(404).json({ message: "Course not found" });
  else {
    const coursesWithFullImageUrls = [result].map((course) => ({
      ...course._doc,
      thumbnail_image: `http://${req.headers.host}/${course.thumbnail_image}`,
      gallary_image: `http://${req.headers.host}/${course.gallary_image}`,
      trainer_materialImage: `http://${req.headers.host}/${course.trainer_materialImage}`,
    }));
    res.status(200).json({ courses: coursesWithFullImageUrls });
  }
});

module.exports = router;
