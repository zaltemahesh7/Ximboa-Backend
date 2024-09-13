const express = require("express");
const router = express.Router();
const Review = require("../../model/Review");

// POST request to add a new review
router.post("/", async (req, res) => {
  const { t_id, c_id, user_id, review, star_count } = req.body;

  // Check if all fields are provided
  if (!t_id || !c_id || !user_id || !review || !star_count) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create a new review object   
    const newReview = new Review({
      t_id,
      c_id,
      user_id,
      review,
      star_count
    });

    // Save the review to the database
    const savedReview = await newReview.save();

    // Respond with the saved review data
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).send();
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
    const reviews = await Review.find({ t_id:trainerId })
      // .populate({
      //   path: 'user_id',
      //   select: 'user_image user_firstname user_lastname',
      // })
      .select('star_count date review_message')
      .exec();

    res.status(200).json(reviews);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});





module.exports = router;
