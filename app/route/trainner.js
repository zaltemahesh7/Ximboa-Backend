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
    const trainerId = req.user.id || req.params.id;

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
    const events = await Event.find({ trainerid: trainerId })
      .populate("event_category", "category_name")
      .populate("trainerid", "user_name");

    const eventsWithThumbnailUrl = events.map((event) => {
      return {
        ...event._doc,
        event_thumbnail: event.event_thumbnail
          ? `${baseUrl}/${event.event_thumbnail.replace(/\\/g, "/")}`
          : "",
      };
    });

    const onlineEvents = events.filter(
      (event) => event.event_type === "Online"
    );
    const onlineEventsThumbnailUrl = onlineEvents.map((event) => {
      return {
        ...event._doc,
        event_thumbnail: event.event_thumbnail
          ? `${baseUrl}/${event.event_thumbnail.replace(/\\/g, "/")}`
          : "",
      };
    });
    const offlienEvents = events.filter(
      (event) => event.event_type === "Offline"
    );
    const offlienEventsThumbnailUrl = offlienEvents.map((event) => {
      return {
        ...event._doc,
        event_thumbnail: event.event_thumbnail
          ? `${baseUrl}/${event.event_thumbnail.replace(/\\/g, "/")}`
          : "",
      };
    });

    // Find About by the trainer
    const About = await About1.find({ trainer: trainerId });

    // Get reviews and groups for each course
    // const courseIds = courses.map((course) => course._id);
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
        photos: gallary.photos.map((photo) => {
          photo ? `${baseUrl}/${photo}` : "";
        }),
      };
    });

    const currentDate = new Date().toISOString();

    const ongoingCourses = await Course.find({
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    })
      .populate("trainer_id", "user_name")
      .populate("category_id", "category_name");

    // Map courses to include full image URLs and trainer name
    const OnGoingBatches = ongoingCourses.map((course) => {
      return {
        ...course._doc,
        thumbnail_image: course.thumbnail_image
          ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
          : "",
        gallary_image: course.gallary_image
          ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
          : "",
        trainer_materialImage: course.trainer_materialImage
          ? `${baseUrl}/${course.trainer_materialImage.replace(/\\/g, "/")}`
          : "",
        trainer_name: course.trainer_id ? course.trainer_id.user_name : "N/A",
      };
    });

    const upcomingCourses = await Course.find({
      start_date: { $gt: currentDate },
    })
      .populate("trainer_id", "user_name")
      .populate("category_id", "category_name");

    // Map courses to include full image URLs and trainer name
    const UpcomingBatches = upcomingCourses.map((course) => {
      return {
        ...course._doc,
        thumbnail_image: course.thumbnail_image
          ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
          : "",
        gallary_image: course.gallary_image
          ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
          : "",
        trainer_materialImage: course.trainer_materialImage
          ? `${baseUrl}/${course.trainer_materialImage.replace(/\\/g, "/")}`
          : "",
        trainer_name: course.trainer_id ? course.trainer_id.user_name : "N/A",
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
      eventsWithThumbnailUrl,
      onlineEventsThumbnailUrl,
      offlienEventsThumbnailUrl,
      About,
      Educations,
      SocialMedias,
      testimonials,
      gallarys,
      OnGoingBatches,
      UpcomingBatches,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error", error });
  }
});

module.exports = router;
