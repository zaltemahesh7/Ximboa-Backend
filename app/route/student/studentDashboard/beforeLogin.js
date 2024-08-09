const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category"); // Assuming you have a Category model
const Trainer = require("../../../../model/registration"); // Assuming you have a Category model

// Get categories with specific fields
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({}, "thumbnail_image category_name");
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send({ message: "Error fetching categories", error });
  }
});

const Course = require("../../../../model/course");

// Get courses with specific fields, including trainer name populated
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find(
      {},
      "course_name thumbnail_image trainer_id"
    ).populate("trainer_id", "name"); // Populate the trainer_id with trainer's name

    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send({ message: "Error fetching courses", error });
  }
});

// Combine the routes
router.get("/", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const categories = await Category.find({}, "category_image category_name");
    const categoriesWithFullImageUrl = categories.map((categorie) => {
      return {
        ...categorie._doc,
        category_image: categorie.category_image
          ? `${baseUrl}/${categorie.category_image.replace(/\\/g, "/")}`
          : "",
      };
    });

    // ===== Course ============================================
    const courses = await Course.find(
      {},
      "course_name thumbnail_image trainer_id"
    ).populate("trainer_id", "name");

    const coursesWithFullImageUrl = courses.map((course) => {
      return {
        ...course._doc,
        thumbnail_image: course.thumbnail_image
          ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
          : "",
      };
    });

    // ===== /Course ============================================

    const trainers = await Trainer.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "trainer_id",
          as: "courses",
        },
      },
      {
        $project: {
          user_name: 1,
          trainer_image: 1,
          course_count: { $size: "$courses" },
        },
      },
    ]);


    const trainersWithFullImageUrl = trainers.map((trainer) => {
      return {
        user_name: trainer.user_name,
        course_count: trainer.course_count,
        trainer_image: trainer.trainer_image
          ? `${baseUrl}/${trainer.trainer_image.replace(/\\/g, "/")}`
          : "",
      };
    });

    res.status(200).send({
      categoriesWithFullImageUrl,
      coursesWithFullImageUrl,
      trainersWithFullImageUrl,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Error fetching data", error });
  }
});

module.exports = router;
