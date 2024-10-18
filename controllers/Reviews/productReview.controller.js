const product = require("../../model/product");
const registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const productReview = asyncHandler(async (req, res) => {
  try {
    const userid = req.user.id;
    const { productid, review, star_count } = req.body;

    const productData = await product.findByIdAndUpdate(productid, {
      $push: {
        reviews: {
          user_id: userid,
          review: review,
          star_count: star_count,
        },
      },
    });

    if (!productData) {
      res.status(404).json(new ApiError(404, "Product not found"));
    } else {
      res
        .status(200)
        .json(
          new ApiResponse(200, "Review Add success,", productData?.product_name)
        );
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

const getReviewsByProductId = asyncHandler(async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const productid = req.params.productid;

  try {
    const productReview = await product.findById(productid).select("reviews");

    if (!productReview) {
      return res.status(404).json(new ApiResponse(404, "Product not found"));
    }

    const totalReviews = productReview.reviews.length;
    const totalPages = Math.ceil(totalReviews / limit);

    if (page > totalPages) {
      return res
        .status(400)
        .json(new ApiResponse(400, `Page ${page} exceeds total pages.`));
    }

    const startIndex = (page - 1) * limit;
    let paginatedReviews = productReview.reviews
      .reverse()
      .slice(startIndex, startIndex + limit);

    paginatedReviews = await Promise.all(
      paginatedReviews.map(async (review) => {
        const populatedReview = await registration.findById(
          review.user_id,
          "f_Name l_Name trainer_image"
        );
        return {
          userid: populatedReview?._id,
          user_name: `${populatedReview?.f_Name || ""} ${
            populatedReview?.l_Name || ""
          }`,
          trainer_image: populatedReview?.trainer_image
            ? `${baseUrl}/${populatedReview?.trainer_image?.replace(
                /\\/g,
                "/"
              )}`
            : "",
          reviewid: review?._id,
          star_count: review?.star_count,
          review: review?.review,
        };
      })
    );

    res.status(200).json(
      new ApiResponse(
        200,
        "Course Reviews",
        {
          productid: productReview?._id,
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

// const getReviewsByProductId = asyncHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 2;
//   const productid = req.params.productid;

//   try {
//     const productReview = await product.findById(productid).select("reviews");

//     if (!productReview) {
//       return res.status(404).json(new ApiResponse(404, "Product not found"));
//     }

//     const totalReviews = productReview.reviews.length;
//     const totalPages = Math.ceil(totalReviews / limit);

//     const startIndex = (page - 1) * limit;
//     const paginatedReviews = productReview.reviews
//       .reverse()
//       .slice(startIndex, startIndex + limit);

//     res.status(200).json(
//       new ApiResponse(
//         200,
//         "Product Reviews",
//         {
//           productid: productReview._id,
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
//           error.message || "Error fetching Product reviews.",
//           error
//         )
//       );
//   }
// });

module.exports = { productReview, getReviewsByProductId };
