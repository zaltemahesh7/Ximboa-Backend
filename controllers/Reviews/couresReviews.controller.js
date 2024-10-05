const { findById } = require("../../model/category");
const Course = require("../../model/course");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const courseReviews = asyncHandler(async (req, res) => {
  try {
    const userid = req.user.id;
    const { courseid, review, star_count } = req.body;
    const course = await Course.findByIdAndUpdate(courseid, {
      $push: {
        reviews: {
          user_id: userid,
          review: review,
          star_count: star_count,
        },
      },
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Review Add success,", course.course_name));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

const getReviewsByCourseId = asyncHandler(async (req, res) => {
  const courseid = req.params.course_id;
  const course = await Course.findById(courseid).select("reviews");
  res.send(course);
});

module.exports = { courseReviews, getReviewsByCourseId };
