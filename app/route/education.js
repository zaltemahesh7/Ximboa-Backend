const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Education = require("../../model/education");

// Fetch all education records
router.get("/", (req, res) => {
  Education.find()
    .then((result) => {
      res.status(200).json({
        educationData: result,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        error: "Failed to fetch education records",
      });
    });
});

// Insert new education record
router.post("/", (req, res) => {
  const trainer_id = req.user.id;
  const { school, college, degree, other_details, achievements } = req.body;

  const education = new Education({
    _id: new mongoose.Types.ObjectId(),
    school: school,
    college: college,
    degree: degree,
    other_details: other_details,
    achievements: achievements,
    trainer_id: trainer_id,
  });

  education
    .save()
    .then((result) => {
      res.status(200).json({
        newEducationDetail: result,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        error: "Failed to save education record",
      });
    });
});

// Fetch single education record by ID
router.get("/:id", (req, res) => {
  Education.findById(req.params.id)
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          error: "Education record not found",
        });
      }
      res.status(200).json({
        education: result,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        error: "Failed to fetch education record",
      });
    });
});

// Delete an education record
router.delete("/:id", (req, res) => {
  Education.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        msg: "Education record deleted successfully",
        result: result,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        error: "Failed to delete education record",
      });
    });
});

// Update an education record
router.put("/:id", (req, res) => {
  Education.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        school: req.body.school,
        college: req.body.college,
        degree: req.body.degree,
        other_details: req.body.other_details,
        achievements: req.body.achievements,
        trainer_id: req.user.id,
      },
    },
    { new: true }
  ) // Return the updated document
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          error: "Education record not found",
        });
      }
      res.status(200).json({
        msg: "Education record updated successfully",
        updatedData: result,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        error: "Failed to update education record",
      });
    });
});

// Fetch education records by trainer ID
router.get("/byTrainer", (req, res) => {
  Education.find({ trainer_id: req.user.id })
    .then((result) => {
      res.status(200).json({
        ByTrainerIDeducation: result,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        error: "Failed to fetch education records by trainer ID",
      });
    });
});

module.exports = router;
