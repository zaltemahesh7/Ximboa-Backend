const express = require("express");
const router = express.Router();
const Review = require("../../model/Review");

// Create a Review
router.post("/", async (req, res) => {
  try {
    const t_id = req.user.id;
    const data = req.body;
    const review = new Review({ t_id, ...data });
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(400).send(error);
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
      return res.status(404).send({msg: "Not Found"});
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
    res.status(200).send(review);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
