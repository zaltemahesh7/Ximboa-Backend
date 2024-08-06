const express = require("express");
const router = express.Router();
const Trainer = require("../../model/registration");
const Course = require("../../model/course");
const Review = require("../../model/Review");
const Question = require("../../model/Questions/Questions");
const Appointment = require("../../model/Appointment/Appointment");
const Enquiry = require("../../model/Enquire");
const Product = require("../../model/product");
const Event = require("../../model/event");
const About1 = require("../../model/about");
const Education = require("../../model/education");

const SocialMedia = require("../../model/socialMedia");

const testemonial = require("../../model/testemonial");

const gallary = require("../../model/gallary");

// Get all data according to the trainer
router.get("/:id/data", async (req, res) => {
  try {
    const trainerId = req.params.id;

    // Find the trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).send({ message: "Trainer not found" });
    }

    // Find courses by the trainer
    const courses = await Course.find({ trainer_id: trainerId });

    // Find question by the trainer
    const question = await Question.find({ t_id: trainerId });
    // Find Appointment by the trainer
    const Appointments = await Appointment.find({ t_id: trainerId });
    // Find Enquiry by the trainer
    const Enquirys = await Enquiry.find({ t_id: trainerId });
    // Find Products by the trainer
    const Products = await Product.find({ t_id: trainerId });

    // Find Events by the trainer
    const Events = await Event.find({ trainer: trainerId });

    // Find About by the trainer
    const About = await About1.find({ trainer: trainerId });

    // Get reviews and groups for each course
    const courseIds = courses.map((course) => course._id);
    const reviews = await Review.find({ c_id: { $in: courseIds } });

    const Educations = await Education.find({ trainer_id: { $in: trainerId } });

    const SocialMedias = await SocialMedia.find({
      trainer_id: { $in: trainerId },
    });

    const testimonials = await testemonial.find({
      trainer_id: { $in: trainerId },
    });

    const gallarys = await gallary.find({ trainer_id: { $in: trainerId } });

    res.status(200).send({
      trainer,
      courses,
      reviews,
      question,
      Appointments,
      Enquirys,
      Products,
      Events,
      About,
      Educations,
      SocialMedias,
      testimonials,
      gallarys,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Server error", error });
  }
});

module.exports = router;
