const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category"); // Assuming you have a Category model
const Trainer = require("../../../../model/registration");

const Course = require("../../../../model/course");
const Event = require("../../../../model/event");
const Product = require("../../../../model/product");
const { ApiError } = require("../../../../utils/ApiError");

// Get courses with specific fields, including trainer name populated
router.get("/home", async (req, res) => {
  try {
    // Get page and limit from query parameters, set defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    const startIndex = (page - 1) * limit;

    const courses = await Course.find()
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name -_id")
      .populate("trainer_id", "f_Name l_Name");

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

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

    const categories = await Category.find().skip(startIndex).limit(limit);

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
    ])
      .skip(startIndex)
      .limit(limit);

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
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err.message || "", err));
  }
});

// ========================-- allcategory ------------------------------=======
router.get("/allcategory", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;

    const categories = await Category.find().skip(startIndex).limit(limit);

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
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err?.message || "", err));
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
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error fetching trainer", err });
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
      res.status(200).json({ course: coursesWithFullImageUrls[0] });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// ========================= event/:id ====================================
router.get("/event/:id", async (req, res) => {
  try {
    const eventWithFullImageUrls = await Event.findById(req.params.id)
      .populate("trainerid", "f_Name l_Name")
      .populate("event_category", "category_name");

    const event = {
      ...eventWithFullImageUrls._doc,
      event_thumbnail: `http://${req.headers.host}/${eventWithFullImageUrls.event_thumbnail}`,
    };
    if (!event) {
      return res.status(404).json(new ApiError(404, "Event not found"));
    }
    res.status(200).json({ event: event });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// ========================= All Event ====================================
router.get("/allevents", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const events = await Event.find()
      .populate("event_category", "category_name")
      .populate("trainerid", "f_Name l_Name");
    if (!events || events.length === 0) {
      return res.status(404).json(new ApiError(404, "Events not found"));
    }

    const eventsWithThumbnails = events.map((event) => ({
      ...event._doc,
      event_thumbnail: event.event_thumbnail
        ? `${baseUrl}/${event.event_thumbnail.replace(/\\/g, "/")}`
        : null,
    }));

    res.status(200).json(eventsWithThumbnails);
  } catch (err) {
    res
      .status(500)
      .json(new ApiError(500, err.message || "Error fetching Events", err));
  }
});

// ========================= product/:id ====================================
// Get a single product by ID
router.get("/product/:id", async function (req, res, next) {
  Product.find({ _id: req.params.id })
    .populate("t_id", "f_Name l_Name")
    .then((result) => {
      const productsWithFullImageUrls = result.map((product) => ({
        ...product._doc,
        product_image: `http://${req.headers.host}/${product.product_image}`,
      }));
      // console.log(productsWithFullImageUrls),
      res.status(200).json(productsWithFullImageUrls[0]);
    })
    .catch((err) => {
      res
        .status(500)
        .json(
          new ApiError(
            500,
            err.message || "Server Error Gretting Product by Id",
            err
          )
        );
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
      res
        .status(500)
        .json(
          new ApiError(
            500,
            err.message || "Server Error Gretting all Products",
            err
          )
        );
    });
});

module.exports = router;
