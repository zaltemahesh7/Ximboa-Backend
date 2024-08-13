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

// Get data according to the trainer Email id

// Get all data according to the trainer
router.get("/", async (req, res) => {
  try {
    const trainerId = req.user.id;

    // Find the trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).send({ message: "Trainer not found" });
    }

    // Find courses by the trainer
    const courses = await Course.find({ trainer_id: trainerId });
    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrl = courses.map((course) => {
      return {
        ...course._doc,
        thumbnail_image: course.thumbnail_image
          ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
          : "",
        gallary_image: course.gallary_image
          ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
          : "",
        trainer_materialImage: course.gallary_image
          ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
          : "",
      };
    });

    // Find question by the trainer
    const question = await Question.find({ t_id: trainerId });
    // Find Appointment by the trainer
    const Appointments = await Appointment.find({ t_id: trainerId });
    // Find Enquiry by the trainer
    const Enquirys = await Enquiry.find({ t_id: trainerId });
    // Find Products by the trainer
    const Products = await Product.find({ t_id: trainerId });

    const productsWithFullImageUrl = Products.map((product) => {
      return {
        ...product._doc,
        product_image: product.product_image
          ? `${baseUrl}/${product.product_image.replace(/\\/g, "/")}`
          : "",
        product_gallary: product.gallary_image
          ? `${baseUrl}/${product.gallary_image.replace(/\\/g, "/")}`
          : "",
      };
    });

    // Find Events by the trainer
    const Events = await Event.find({ trainerid: trainerId });

    // Find About by the trainer
    const About = await About1.find({ trainer: trainerId });

    // Get reviews and groups for each course
    const courseIds = courses.map((course) => course._id);
    const reviews = await Review.find({ t_id: trainerId });

    const Educations = await Education.find({ trainer_id: { $in: trainerId } });

    const SocialMedias = await SocialMedia.find({
      trainer_id: { $in: trainerId },
    });

    const testimonials = await testemonial.find({
      trainer_id: { $in: trainerId },
    });

    const gallarysWithoutImages = await gallary.find({
      trainer_id: { $in: trainerId },
    });
    const gallarys = gallarysWithoutImages.map((gallary) => {
      return {
        ...gallary._doc,
        photos: gallary.photos
          ? `${baseUrl}/${gallary.photos.map((i) => i.replace(/\\/g, "/"))}`
          : "",
      };
    });

    res.status(200).send({
      trainer,
      coursesWithFullImageUrl,
      reviews,
      question,
      Appointments,
      Enquirys,
      productsWithFullImageUrl,
      Events,
      About,
      Educations,
      SocialMedias,
      testimonials,
      gallarys,
    });
  } catch (error) {
    // console.log(error);

    res.status(500).send({ message: "Server error", error });
  }
});

module.exports = router;
