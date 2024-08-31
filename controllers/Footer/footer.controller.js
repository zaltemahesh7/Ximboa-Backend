const Registration = require("../../model/registration");
const Categories = require("../../model/category");
const Course = require("../../model/course");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const registration = require("../../model/registration");
const Product = require("../../model/product");
const Event = require("../../model/event");

const Footer = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find().select("course_name");
    const Category = await Categories.find().select("category_name");
    const trainers = await registration.find(
      { role: { $in: ["TRAINER", "SELF_TRAINER"] } },
      "f_Name l_Name"
    );
    const products = await Product.find().select("product_name");
    const events = await Event.find().select("event_name");
    res.status(200).json({
      Category,
      courses,
      trainers,
      products,
      events,
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
});

module.exports = { Footer };
