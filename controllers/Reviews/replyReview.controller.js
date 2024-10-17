const course = require("../../model/course");
const { ApiError } = require("../../utils/ApiError");
const { asyncHandler } = require("../../utils/asyncHandler");

// Assuming you have reviewId and reply data in the request body
const replyReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const user_id = req.user.id;

  try {
    const review = await course.findOneAndUpdate(
      { "reviews._id": reviewId },
      {
        $push: {
          "reviews.$.replies": {
            user_id: user_id,
            reply: reply,
            repliedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json(review);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        new ApiError(500, error.message || "Error fetching while reply", error)
      );
  }
});

module.exports = replyReview;
