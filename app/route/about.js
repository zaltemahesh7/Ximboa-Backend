const express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var About = require("../../model/about");

// Get all About data
router.get("/", function (req, res, next) {
  About.find()
    .then((result) => {
      res.status(200).json({
        aboutData: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Add new About data
router.post("/", function (req, res, next) {
  var about = new About({
    _id: new mongoose.Types.ObjectId(),
    about_us: req.body.about_us,
    our_services: req.body.our_services,
    trainer: req.body.trainer,
  });

  about
    .save()
    .then((result) => {
    //   console.log(result);
      res.status(200).json({
        newAbout: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Get About data by ID
router.get("/:id", function (req, res, next) {
  console.log(req.params.id);
  About.findById(req.params.id)
    .then((result) => {
    //   console.log(result);
      res.status(200).json({
        aboutData: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Delete About data by ID
router.delete("/:id", function (req, res, next) {
  About.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        msg: "data successfully deleted",
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// Update About data by ID
router.put("/:id", function (req, res, next) {
  About.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        about_us: req.body.about_us,
        our_services: req.body.our_services,
        trainer: req.body.trainer,
      },
    },
    { new: true }
  ) // Ensures the updated document is returned
    .then((result) => {
      res.status(200).json({
        msg: "data successfully updated",
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// Get About data by trainer ID
router.get("/bytrainer/:trainerId", function (req, res, next) {
  About.find({ trainer: req.params.trainerId })
    .then((result) => {
      res.status(200).json({
        byTrainerAboutData: result,
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
