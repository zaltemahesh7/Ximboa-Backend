const Registration = require("../../model/registration");
const Categories = require("../../model/category");
const Course = require("../../model/course");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const categoriesDataFooter = asyncHandler(async (req, res) => {
  try {
    const categories = await Categories.find().select("category_name -_id");
    res.status(200).json(new ApiResponse(200, "Category data", categories));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
});

const coursesDataFooter = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find().select("course_name -_id");
    res.status(200).json(new ApiResponse(200, "Courses data", courses));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
});

module.exports = { categoriesDataFooter, coursesDataFooter };
