const express = require("express");
const router = express.Router();
const Review = require('../../model/Review');

// Create a Review
router.post("/", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all Reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).send(reviews);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Review by ID
router.get("/reviews/:id", async (req, res) => {
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
router.put("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      return res.status(404).send();
    }
    res.status(200).send(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Review
router.delete("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).send();
    }
    res.status(200).send(review);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;