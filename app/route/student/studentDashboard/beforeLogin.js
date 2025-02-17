const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category"); // Assuming you have a Category model
const Trainer = require("../../../../model/registration");

const Course = require("../../../../model/course");
const Event = require("../../../../model/event");
const Product = require("../../../../model/product");

// Get courses with specific fields, including trainer name populated
router.get("/", async (req, res) => {
  try {
    // Get page and limit from query parameters, set defaults if not provided
    const page = parseInt(req.query.page) || 1; // Default to first page
    const limit = parseInt(req.query.limit) || 10; // Default to 10 courses per page

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;

    // Fetch courses with pagination
    const courses = await Course.find()
      .skip(startIndex)
      .limit(limit)
      .populate("category_id")
      .populate("trainer_id");

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    // Map courses to include full image URLs
    const coursesWithFullImageUrl = courses.map((course) => {
      return {
        ...course._doc,
        thumbnail_image: course.thumbnail_image
          ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
          : "",
        gallary_image: course.gallary_image
          ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
          : "",
        trainer_materialImage: course.trainer_materialImage
          ? `${baseUrl}/${course.trainer_materialImage.replace(/\\/g, "/")}`
          : "",
      };
    });

    const categories = await Category.find();

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category.category_name,
        category_image: category.category_image
          ? `${baseUrl}/${category.category_image.replace(/\\/g, "/")}`
          : "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });
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
      trainersWithFullImageUrl,
      categoriesWithFullImageUrl,
      coursesWithFullImageUrl,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching", error });
  }
});

// ========================-- allcategory ------------------------------=======
router.get("/allcategory", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const categories = await Category.find();

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category.category_name,
        category_image: category.category_image
          ? `${baseUrl}/${category.category_image.replace(/\\/g, "/")}`
          : "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });

    res.status(200).send({
      categoriesWithFullImageUrl,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Error fetching categories", error });
  }
});

// ======================================all Courses===================----------
router.get("/allcourses", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("category_id")
      .populate("trainer_id");

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    // Map courses to include full image URLs
    const coursesWithFullImageUrl = courses.map((course) => {
      return {
        ...course._doc,
        thumbnail_image: course.thumbnail_image
          ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
          : "",
        gallary_image: course.gallary_image
          ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
          : "",
        trainer_materialImage: course.trainer_materialImage
          ? `${baseUrl}/${course.trainer_materialImage.replace(/\\/g, "/")}`
          : "",
      };
    });

    res.status(200).send({
      coursesWithFullImageUrl,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Error fetching courses", error });
  }
});

// ========================= All Trainers ====================================
router.get("/alltrainers", async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
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
      trainersWithFullImageUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching trainer", error });
  }
});

// ========================= course/:id ====================================
router.get("/course/:id", (req, res, next) => {
  Course.find({ _id: req.params.id })
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

// ========================= event/:id ====================================
router.get("/event/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// ========================= All Event ====================================
router.get("/allevents", async (req, res) => {
  try {
    const event = await Event.find();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// ========================= product/:id ====================================
// Get a single product by ID
router.get("/product/:id", async function (req, res, next) {
  Product.find({ _id: req.params.id })
    .then((result) => {
      const productsWithFullImageUrls = result.map((product) => ({
        ...product._doc,
        product_image: `http://${req.headers.host}/${product.product_image}`,
      }));
      // console.log(productsWithFullImageUrls),
      res.status(200).json({ productsWithFullImageUrls });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// Get a single product by ID
router.get("/allproduct", async function (req, res, next) {
  Product.find()
    .then((result) => {
      const productsWithFullImageUrls = result.map((product) => ({
        ...product._doc,
        product_image: `http://${req.headers.host}/${product.product_image}`,
      }));
      // console.log(productsWithFullImageUrls),
      res.status(200).json({ productsWithFullImageUrls });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
