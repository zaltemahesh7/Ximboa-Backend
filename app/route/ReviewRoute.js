const express = require("express");
const router = express.Router();
const Review = require("../../model/Review");
const { jwtAuthMiddleware } = require("../../middleware/auth");

// POST request to add a new review
router.post("/", jwtAuthMiddleware, async (req, res) => {
  const { t_id, c_id, review, star_count } = req.body;
  const user_id = req.user.id;

  try {
    // Create a new review object
    const newReview = new Review({
      t_id,
      c_id,
      user_id,
      review,
      star_count,
    });

    const savedReview = await newReview.save();

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error });
  }
});

// Get all Reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).send(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Get Review by ID
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send();
    }
    res.status(200).send(review);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update Review
router.put("/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      return res.status(404).send({ msg: "Not Found" });
    }
    res.status(200).send(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Review
router.delete("/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).send("Not found");
    }
    res.status(200).send("review deleted sucessfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all reviews by trainer ID
router.get("/reviews/trainer/:trainerId", async (req, res) => {
  const { trainerId } = req.params;

  try {
    const reviews = await Review.find({ t_id: trainerId })
      .populate({
        path: "user_id",
        select: " trainer_image f_Name l_Name",
      })
      .select("star_count date review")
      .exec();

    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});

const {
  courseReviews,
  getReviewsByCourseId,
} = require("../../controllers/Reviews/couresReviews.controller");
const {
  productReview,
  getReviewsByProductId,
} = require("../../controllers/Reviews/productReview.controller");
const {
  eventReview,
  getReviewsByEventId,
} = require("../../controllers/Reviews/eventReview.controller");

router.post("/course", jwtAuthMiddleware, courseReviews);
router.post("/product", jwtAuthMiddleware, productReview);
router.post("/event", jwtAuthMiddleware, eventReview);

router.get("/course/:courseid", getReviewsByCourseId);
router.get("/product/:productid", getReviewsByProductId);
router.get("/event/:eventid", getReviewsByEventId);

module.exports = router;
