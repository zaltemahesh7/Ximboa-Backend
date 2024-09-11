const express = require("express");
const mongoose = require("mongoose");
const Question = require("../../../model/Student/Question"); // Assuming Question model is in models directory
const Course = require("../../../model/course"); // Assuming Course model is in models directory
const Student = require("../../../model/Student/Student"); // Assuming Student model is in models directory
const {
  jwtAuthMiddleware,
  generateToken,
} = require("../../../middleware/auth");
const { asyncHandler } = require("../../../utils/asyncHandler");

const router = express.Router();

// POST route to ask a question
// router.post("/", async (req, res) => {
//   try {
//     const { student_id, course_id, question_text } = req.body;

//     // Check if the course exists
//     const course = await Course.findById(course_id);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // Check if the student exists
//     const student = await Student.findById(student_id);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Create a new question
//     const question = new Question({
//       student_id,
//       course_id,
//       question_text,
//     });

//     const result = await question.save();
//     res
//       .status(201)
//       .json({ message: "Question asked successfully", question: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

router.post(
  "/",
  jwtAuthMiddleware,
  asyncHandler(async (req, res) => {
    try {
      const userid = req.user.id;
      const { trainerid, question, courseid } = req.body;

      if (!trainerid || !question) {
        return res
          .status(400)
          .json({ message: "Trainer ID and question are required." });
      }

      const newQuestion = new Question({
        userid: userid,
        trainerid: trainerid,
        question: question,
        courseid,
      });

      await newQuestion.save();

      res.status(201).json({
        message: "Question posted successfully.",
        question: newQuestion,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  })
);

// GET route to get questions related to a course
router.get("/course/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const questions = await Question.find({ course_id: courseId }).populate(
      "student_id",
      "name"
    );

    if (!questions) {
      return res
        .status(404)
        .json({ message: "No questions found for this course" });
    }

    res.status(200).json({ questions: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
