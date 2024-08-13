const express = require("express");
const router = express.Router();
const Question = require("../../../model/Questions/Questions");

// Create a new question
router.post("/", async (req, res) => {
  try {
    const { c_id, question } = req.body;
    const t_id = req.user.id;
    const newQuestion = new Question({ c_id, t_id, question });
    await newQuestion.save();
    res.status(201).send(newQuestion);
  } catch (error) {
    console.log(error);
    
    res.status(400).send({ message: "Error creating question", error });
  }
});

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().populate("c_id").populate("t_id");
    res.status(200).send(questions);
  } catch (error) {
    res.status(500).send({ message: "Error fetching questions", error });
  }
});

// Get questions by course ID
router.get("/course/:c_id", async (req, res) => {
  try {
    const questions = await Question.find({ c_id: req.params.c_id })
      .populate("c_id")
      .populate("t_id");
    res.status(200).send(questions);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching questions by course ID", error });
  }
});

// Get questions by trainer ID
router.get("/trainer/:t_id", async (req, res) => {
  try {
    const questions = await Question.find({ t_id: req.params.t_id })
      .populate("c_id")
      .populate("t_id");
    res.status(200).send(questions);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching questions by trainer ID", error });
  }
});

module.exports = router;
