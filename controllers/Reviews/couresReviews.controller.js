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

// const getReviewsByCourseId = async (req, res) => {
//   const page = parseInt(req.body.page) || 1; // current page number, defaults to 1
//   const limit = parseInt(req.body.limit) || 2; // number of reviews per page, defaults to 2
//   const courseid = req.body.courseid;

//   console.log(req.body);

//   try {
//     // Fetch the course by ID but only select the reviews field
//     const courseReview = await Course.findById(courseid).select("reviews");

//     if (!courseReview) {
//       return res.status(404).json(new ApiResponse(404, "Course not found"));
//     }

//     const totalReviews = courseReview.reviews.length; // Total number of reviews
//     const totalPages = Math.ceil(totalReviews / limit);

//     // Check if the requested page is within valid range
//     if (page > totalPages) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, `Page ${page} exceeds total pages.`));
//     }

//     // Pagination logic (skip and limit)
//     const startIndex = (page - 1) * limit; // Calculate the starting index
//     const paginatedReviews = courseReview.reviews
//       .reverse()
//       .slice(startIndex, startIndex + limit); // Slice reviews for pagination

//     // Send the paginated reviews along with metadata
//     res.status(200).json(
//       new ApiResponse(
//         200,
//         "Course Reviews",
//         {
//           courseId: courseReview._id,
//           reviews: paginatedReviews,
//         },
//         {
//           currentPage: page,
//           totalPages: totalPages,
//           totalReviews: totalReviews,
//           pageSize: limit,
//         }
//       )
//     );
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json(
//         new ApiError(
//           500,
//           error.message || "Error fetching course reviews.",
//           error
//         )
//       );
//   }
// };

const getReviewsByCourseId = async (req, res) => {
  const page = parseInt(req.body.page) || 1; // current page number, defaults to 1
  const limit = parseInt(req.body.limit) || 2; // number of reviews per page, defaults to 2
  const courseid = req.body.courseid;

  try {
    // Fetch the course by ID and select only the reviews field
    const courseReview = await Course.findById(courseid).select("reviews");

    if (!courseReview) {
      return res.status(404).json(new ApiResponse(404, "Course not found"));
    }

    const totalReviews = courseReview.reviews.length; // Total number of reviews
    const totalPages = Math.ceil(totalReviews / limit); // Calculate total pages

    // Check if the requested page is within valid range
    if (page > totalPages && totalPages !== 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, `Page ${page} exceeds total pages.`));
    }

    // Pagination logic (skip and limit)
    const startIndex = (page - 1) * limit; // Calculate the starting index
    const paginatedReviews = courseReview.reviews
      .slice(startIndex, startIndex + limit) // Slice reviews for pagination
      .reverse(); // Reverse to show the latest reviews first

    // Send the paginated reviews along with metadata
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
};

module.exports = { courseReviews, getReviewsByCourseId };
