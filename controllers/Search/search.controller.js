const Course = require("../../model/course");
const Category = require("../../model/category");
const Registration = require("../../model/registration"); // Assuming trainers are stored in Registration
const Product = require("../../model/product");
const Event = require("../../model/event");
const { ApiError } = require("../../utils/ApiError"); // Custom response classes
const { ApiResponse } = require("../../utils/ApiResponse"); // Custom response classes

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

    // Promise to search in all collections
    const [courses, categories, trainers, products, events] = await Promise.all(
      [
        Course.find({ course_name: searchRegex })
          .limit(4)
          .select("course_name thumbnail_image"),
        Category.find({ category_name: searchRegex })
          .limit(4)
          .select("category_name category_image"),
        Registration.find({
          role: { $in: ["TRAINER", "SELF_TRAINER"] },
          $or: [{ f_Name: searchRegex }, { l_Name: searchRegex }],
        })
          .limit(4)
          .select("f_Name l_Name trainer_image"),
        Product.find({ product_name: searchRegex })
          .limit(4)
          .select("product_name product_image"),
        Event.find({ event_name: searchRegex })
          .limit(4)
          .select("event_name event_thumbnail"),
      ]
    );

    // Send results in response
    res.status(200).json(
      new ApiResponse(200, "search reault", {
        courses,
        categories,
        trainers,
        products,
        events,
      })
    );
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

module.exports = { globalSearch };
