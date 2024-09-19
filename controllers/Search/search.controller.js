// const Course = require("../../model/course");
// const Category = require("../../model/category");
// const Registration = require("../../model/registration"); // Assuming trainers are stored in Registration
// const Product = require("../../model/product");
// const Event = require("../../model/event");
// const { ApiError } = require("../../utils/ApiError"); // Custom response classes
// const { ApiResponse } = require("../../utils/ApiResponse"); // Custom response classes

// const globalSearch = async (req, res) => {
//   const searchTerm = req.query.q;

//   // Validate search term length
//   if (!searchTerm || searchTerm.length < 3) {
//     return res
//       .status(400)
//       .json(
//         new ApiError(400, "Search term must be at least 3 characters long.")
//       );
//   }

//   try {
//     // Define a regex for search term (case-insensitive)
//     const searchRegex = new RegExp(searchTerm, "i");

//     // Promise to search in all collections
//     const [courses, categories, trainers, products, events] = await Promise.all(
//       [
//         Course.find({ course_name: searchRegex })
//           .populate("category_id", "category_name")
//           .limit(4)
//           .select("course_name thumbnail_image"),
//         Category.find({ category_name: searchRegex })
//           .limit(4)
//           .select("category_name category_image"),
//         Registration.find({
//           role: { $in: ["TRAINER", "SELF_TRAINER"] },
//           $or: [{ f_Name: searchRegex }, { l_Name: searchRegex }],
//         })
//           .limit(4)
//           .select("f_Name l_Name trainer_image"),
//         Product.find({ product_name: searchRegex })
//           .populate("categoryid", "category_name")
//           .limit(4)
//           .select("product_name product_image"),
//         Event.find({ event_name: searchRegex })
//           .limit(4)
//           .select("event_name event_thumbnail"),
//       ]
//     );

//     // Send results in response
//     res.status(200).json({
//       courses,
//       categories,
//       trainers,
//       products,
//       events,
//     });
//   } catch (error) {
//     // console.error(error);
//     res
//       .status(500)
//       .json(new ApiError(500, error.message || "Server Error", error));
//   }
// };

// module.exports = { globalSearch };

const Course = require("../../model/course");
const Category = require("../../model/category");
const Registration = require("../../model/registration"); // Trainers are stored in Registration
const Product = require("../../model/product");
const Event = require("../../model/event");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

const globalSearch = async (req, res) => {
  const searchTerm = req.query.q;

  // Validate search term length
  if (!searchTerm || searchTerm.length < 3) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Search term must be at least 3 characters long.")
      );
  }

  try {
    // Define a regex for search term (case-insensitive)
    const searchRegex = new RegExp(searchTerm, "i");

    // Enhanced multi-field search query
    const searchQuery = {
      $or: [
        { course_name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }, // Assuming you have tags or other metadata fields
      ],
    };

    // Promise to search in all collections
    const [
      unFormattedCourses,
      unFormattedTrainers,
      unFormattedProducts,
      unFormattedEvents,
    ] = await Promise.all([
      // Search courses by course_name, description, and tags
      Course.find(searchQuery)
        .populate("category_id", "category_name")
        .limit(4)
        .select("course_name thumbnail_image"),

      // Search categories by name
      // Category.find({ category_name: searchRegex })
      //   .limit(4)
      //   .select("category_name category_image"),

      // Search trainers by first name, last name, and other fields
      Registration.find({
        role: { $in: ["TRAINER", "SELF_EXPERT"] },
        $or: [
          { f_Name: searchRegex },
          { l_Name: searchRegex },
          // { bio: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "categories",
          select: "category_name _id", // Explicitly select the _id and category_name
          model: "Category",
        })
        .limit(4)
        .select("f_Name l_Name trainer_image bio"),

      // Search products by product_name and product description
      Product.find({
        $or: [
          { product_name: searchRegex },
          { product_description: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .populate("categoryid", "category_name")
        .limit(4)
        .select("product_name product_image product_description"),

      // Search events by event_name and description
      Event.find({
        $or: [
          { event_name: searchRegex },
          { event_description: searchRegex }, // Assuming you have an event description field
        ],
      })
        .sort({ createdAt: -1 })
        .populate("event_category", "category_name")
        .limit(4)
        .select("event_name event_thumbnail event_description"),
    ]);
    const baseUrl = req.protocol + "://" + req.get("host");

    const Courses = unFormattedCourses.map((course) => ({
      _id: course?._id,
      course_name: course?.course_name,
      thumbnail_image: course?.thumbnail_image
        ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
        : "",
      description: course?.description,
      tags: course?.tags,
      category_name: course?.category_id
        ? course?.category_id?.category_name
        : null,
    }));

    const trainers = unFormattedTrainers.map((trainer) => ({
      _id: trainer?._id,
      f_Name: trainer?.f_Name,
      l_Name: trainer?.l_Name,
      category: trainer?.categories,
    }));

    const products = unFormattedProducts.map((product) => ({
      _id: product?._id,
      product_name: product?.product_name,
      product_image: product?.product_image
        ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
        : "",
      product_description: product?.product_description,
      category: product?.categoryid?.category_name,
    }));

    const events = unFormattedEvents.map((event) => ({
      _id: event?._id,
      product_name: event?.event_name,
      product_image: event?.event_thumbnail
        ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
        : "",
      category: event?.event_category?.category_name,
    }));

    res.status(200).json({
      Courses,
      trainers,
      products,
      events,
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

module.exports = { globalSearch };
