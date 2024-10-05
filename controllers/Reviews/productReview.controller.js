const { findById } = require("../../model/category");
const Course = require("../../model/course");
const product = require("../../model/product");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const productReview = asyncHandler(async (req, res) => {
  try {
    const userid = req.user.id;
    const { productid, review, star_count } = req.body;
    const product = await product.findByIdAndUpdate(productid, {
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
      .json(new ApiResponse(200, "Review Add success,", product.product_name));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

const getReviewsByCourseId = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const courseid = req.params.courseid;

  try {
    const courseReview = await Course.findById(courseid).select("reviews");

    if (!courseReview) {
      return res.status(404).json(new ApiResponse(404, "Course not found"));
    }

    const totalReviews = productReview.reviews.length;
    const totalPages = Math.ceil(totalReviews / limit);

    if (page > totalPages) {
      return res
        .status(400)
        .json(new ApiResponse(400, `Page ${page} exceeds total pages.`));
    }

    const startIndex = (page - 1) * limit;
    const paginatedReviews = courseReview.reviews
      .reverse()
      .slice(startIndex, startIndex + limit);

    res.status(200).json(
      new ApiResponse(
        200,
        "Course Reviews",
        {
          courseId: courseReview._id,
          reviews: paginatedReviews,
        },
        {
          currentPage: page,
          totalPages: totalPages,
          totalReviews: totalReviews,
          pageSize: limit,
        }
      )
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message || "Error fetching course reviews.",
          error
        )
      );
  }
});

// const getReviewsByCourseId = asyncHandler(async (req, res) => {
//   const page = req.query.page || 1;
//   const limit = req.query.limit || 2;
//   const courseid = req.params.courseid;

//   const courseReview = await Course.findById(courseid)
//     .select("reviews")
//     .limit(limit)
//   res.status(200).json(
//     new ApiResponse(200, "Course Reviews", {
//       _id: courseReview._id,
//       reviews: courseReview.reviews.reverse(),
//     })
//   );
// });

module.exports = { productReview, getReviewsByCourseId };
