var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Gallery = require("../../model/gallary");
var multer = require("multer");

// Set up storage and file naming
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// Get all gallery data
router.get("/", function (req, res, next) {
  Gallery.find()
    .then((result) => {
      res.status(200).json({
        galleryData: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Insert data into database
router.post("/", upload.array("photos", 5), function (req, res, next) {
  const gallery = new Gallery({
    _id: new mongoose.Types.ObjectId(),
    photos: req.files.map((file) => file.path),
    trainer_id: req.body.trainer_id,
  });

  gallery
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Gallery successfully created",
        createdGallery: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Single data access
router.get("/:id", function (req, res, next) {
  Gallery.findById(req.params.id)
    .then((result) => {
      res.status(200).json({
        gallery: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Delete API request
router.delete("/:id", function (req, res, next) {
  Gallery.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        msg: "Data successfully deleted",
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// Update API
router.put("/:id", upload.array("photos", 3), function (req, res, next) {
  Gallery.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        photos: req.files.map((file) => file.path), // Update with an array of file paths
        trainer_id: req.body.trainer_id, // Update the trainer ID if needed
      },
    },
    { new: true }
  ) // Return the updated document
    .then((result) => {
      res.status(200).json({
        updatedData: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// Get gallery data by trainer ID
router.get("/trainerID/:trainerId/", function (req, res, next) {
  Gallery.find({ trainer_id: req.params.trainerId })
    .then((result) => {
      res.status(200).json({
        ByTrainerIDgalleryData: result,
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
