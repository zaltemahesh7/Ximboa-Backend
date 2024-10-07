const Event = require("../../model/event");
const registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const eventReview = asyncHandler(async (req, res) => {
  try {
    const userid = req.user.id;
    const { eventid, review, star_count } = req.body;
    if (!eventid || !star_count) {
      res
        .status(400)
        .json(new ApiError(400, "eventid, star_count is required"));
    } else {
      const eventData = await Event.findByIdAndUpdate(eventid, {
        $push: {
          reviews: {
            user_id: userid,
            review: review,
            star_count: star_count,
          },
        },
      });

      if (!eventData) {
        res.status(404).json(new ApiError(404, "Event not found"));
      } else {
        res
          .status(200)
          .json(
            new ApiResponse(200, "Review Add success,", eventData?.event_name)
          );
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

const getReviewsByEventId = asyncHandler(async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const eventid = req.params.eventid;

  try {
    const eventReview = await Event.findById(eventid).select("reviews");

    if (!eventReview) {
      return res.status(404).json(new ApiResponse(404, "Event not found"));
    }

    const totalReviews = eventReview.reviews.length;
    const totalPages = Math.ceil(totalReviews / limit);

    if (page > totalPages) {
      return res
        .status(400)
        .json(new ApiResponse(400, `Page ${page} exceeds total pages.`));
    }

    const startIndex = (page - 1) * limit;
    let paginatedReviews = eventReview.reviews
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
          user_name: `${populatedReview?.f_Name} ${populatedReview?.l_Name}`,
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
        "Event Reviews",
        {
          eventId: eventReview?._id,
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
          error.message || "Error fetching event reviews.",
          error
        )
      );
  }
});

module.exports = { eventReview, getReviewsByEventId };
