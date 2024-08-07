const express = require('express');
const mongoose = require('mongoose');
const Enrollment = require('../../../model/Student/Enrollment'); // Assuming Enrollment model is in models directory
const Course = require('../../../model/course'); // Assuming Course model is in models directory
const Student = require('../../../model/Student/Student'); // Assuming Student model is in models directory

const router = express.Router();

// POST route to enroll in a course
router.post('/', async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    // Check if the course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the student exists
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({ student_id, course_id });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }

    // Create a new enrollment
    const enrollment = new Enrollment({
      student_id,
      course_id
    });

    const result = await enrollment.save();
    res.status(201).json({ message: 'Enrollment successful', enrollment: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
