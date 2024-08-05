var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Testimonial = require("../../model/testemonial");

// Get all testimonials
router.get("/", function (req, res, next) {
  Testimonial.find()
    .then((result) => {
      res.status(200).json({
        allTestimonials: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Insert testimonial into database
router.post("/", function (req, res, next) {
  var testimonial = new Testimonial({
    _id: new mongoose.Types.ObjectId(),
    Testimonial: req.body.Testimonial,
    Testimonial_Autor_Name: req.body.Testimonial_Autor_Name,
    trainer_id: req.body.trainer_id // Save the trainer ID
  });

  testimonial.save()
    .then((result) => {
      res.status(200).json({
        newTestimonial: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Single testimonial access
router.get("/:id", function (req, res, next) {
  Testimonial.findById(req.params.id)
    .then((result) => {
      res.status(200).json({
        testimonial: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Delete testimonial
router.delete("/:id", function (req, res, next) {
  Testimonial.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        msg: "data deleted successfully",
        result: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Update testimonial
router.put("/:id", function (req, res, next) {
  Testimonial.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        Testimonial: req.body.Testimonial,
        Testimonial_Autor_Name: req.body.Testimonial_Autor_Name,
        trainer_id: req.body.trainer_id // Update the trainer ID if needed
      },
    }
  )
    .then((result) => {
      res.status(200).json({
        msg: "data updated successfully",
        updatedTestimonial: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Get testimonials by trainer ID
router.get("/trainerID/:trainerId", function (req, res, next) {
  Testimonial.find({ trainer_id: req.params.trainerId })
    .then((result) => {
      res.status(200).json({
        ByTrainerIDtestimonials: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
