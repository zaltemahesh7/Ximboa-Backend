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
    const [courses, categories, trainers, products, events] = await Promise.all(
      [
        // Search courses by course_name, description, and tags
        Course.find(searchQuery)
          .populate("category_id", "category_name")
          .limit(4)
          .select("course_name thumbnail_image description tags"),

        // Search categories by name
        Category.find({ category_name: searchRegex })
          .limit(4)
          .select("category_name category_image"),

        // Search trainers by first name, last name, and other fields
        Registration.find({
          role: { $in: ["TRAINER", "SELF_TRAINER"] },
          $or: [
            { f_Name: searchRegex },
            { l_Name: searchRegex },
            { bio: searchRegex }, // Assuming trainers have a bio or description field
          ],
        })
          .populate({
            path: "categories", // Populating the categories field
            select: "category_name", // Selecting only the category_name from the populated categories
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
          .limit(4)
          .select("event_name event_thumbnail event_description"),
      ]
    );

    // Send results in response
    res.status(200).json({
      courses,
      categories,
      trainers,
      products,
      events,
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

module.exports = { globalSearch };
