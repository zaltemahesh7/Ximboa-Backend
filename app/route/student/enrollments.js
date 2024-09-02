const express = require("express");
const mongoose = require("mongoose");
const Enrollment = require("../../../model/Student/Enrollment");
const Course = require("../../../model/course");
const { jwtAuthMiddleware } = require("../../../middleware/auth");
const { ApiError } = require("../../../utils/ApiError");
const Registration = require("../../../model/registration");

const router = express.Router();

// POST route to enroll in a course
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const { course_id } = req.body;
    const userid = req.user.id;

    // Check if the course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the student exists
    const student = await Registration.findById(userid);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({
      userid,
      course_id,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Student is already enrolled in this course" });
    }

    // Create a new enrollment
    const enrollment = new Enrollment({
      userid,
      course_id,
    });

    const result = await enrollment.save();
    res
      .status(201)
      .json({ message: "Enrollment successful", enrollment: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

router.get("/", async (req, res) => {
  try {
    const enrollment = await Enrollment.find();
    res.status(200).send(enrollment);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/student", jwtAuthMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      userid: req.user.id,
    }).populate("course_id", "course_name");
    if (enrollments.length === 0) {
      return res
        .status(404)
        .send({ message: "No enrollments found for this student" });
    }
    res.status(200).send(enrollments[0]);
  } catch (error) {
    res.status(500).send({ message: "Error fetching enrollments", error });
  }
});

router.get("/course/:course_id", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course_id: req.params.course_id,
    });
    if (enrollments.length === 0) {
      return res
        .status(404)
        .send({ message: "No enrollments found for this course" });
    }
    res.status(200).send(enrollments);
  } catch (error) {
    res.status(500).send({ message: "Error fetching enrollments", error });
  }
});

module.exports = router;
