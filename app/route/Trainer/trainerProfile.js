const express = require("express");
const router = express.Router();
const Trainer = require("../../../model/registration");
const Course = require("../../../model/course");
const Review = require("../../../model/Review");
const Question = require("../../../model/Student/Question");
const Appointment = require("../../../model/Appointment/Appointment");
const Enquiry = require("../../../model/Enquire");
const Product = require("../../../model/product");
const Event = require("../../../model/event");
const about = require("../../../model/about");
const Education = require("../../../model/education");
const SocialMedia = require("../../../model/socialMedia");
const testemonial = require("../../../model/testemonial");
const gallary = require("../../../model/gallary");
const { ApiError } = require("../../../utils/ApiError");
const InstituteModel = require("../../../model/Institute/Institute.model");

// Get data according to the trainer Email id

// Get all data according to the trainer
router.get("/:id", async (req, res) => {
  try {
    const trainerId = req.params.id;
    // const institutes = await InstituteModel.find({ trainers: trainerId });
    const trainer = await Trainer.findById(trainerId).select("-password -role");
    if (!trainer) {
      return res.status(404).send({ message: "Trainer not found" });
    }
    
    const institutes = await InstituteModel.findOne({ trainers: trainerId });

    const courses = await Course.find({ trainer_id: trainerId }).sort({
      createdAt: -1,
    });
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
    const question = await Question.find({ t_id: trainerId }).sort({
      createdAt: -1,
    });
    // Find Appointment by the trainer
    const Appointments = await Appointment.find({ t_id: trainerId }).sort({
      createdAt: -1,
    });
    // Find Enquiry by the trainer
    const Enquirys = await Enquiry.find({ t_id: trainerId }).sort({
      createdAt: -1,
    });
    // Find Products by the trainer
    const Products = await Product.find({ t_id: trainerId }).sort({
      createdAt: -1,
    });

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
      .sort({
        createdAt: -1,
      })
      .populate("event_category", "category_name");
    // .populate("trainerid", "f_Name l_Name");

    const eventsWithThumbnailUrl = events.map((event) => {
      return {
        ...event._doc,
        event_thumbnail: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
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
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
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
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
      };
    });

    // Find About by the trainer
    const About = await about.find({ trainer: trainerId });

    // const courseIds = courses.map((course) => course._id);
    const reviewsData = await Review.find({ t_id: trainerId })
      .sort({
        createdAt: -1,
      })
      .populate("user_id", "f_Name l_Name trainer_image");
    const reviews = reviewsData.map((review) => {
      return {
        _id: review?._id,
        user_id: review?.user_id?._id,
        f_Name: review?.user_id?.f_Name,
        l_Name: review?.user_id?.l_Name,
        user_image: review?.user_id?.trainer_image
          ? `${baseUrl}/${review?.user_id?.trainer_image.replace(/\\/g, "/")}`
          : "",
        review: review?.review,
        star_count: review?.star_count,
        createdAt: review?.createdAt,
      };
    });
    const Educations = await Education.find({ trainer_id: { $in: trainerId } });

    const SocialMedias = await SocialMedia.find({
      trainer_id: { $in: trainerId },
    });

    const testimonials = await testemonial
      .find({
        trainer_id: { $in: trainerId },
      })
      .sort({
        createdAt: -1,
      });

    const gallarysWithoutImages = await gallary
      .find({
        trainer_id: { $in: trainerId },
      })
      .sort({
        createdAt: -1,
      });
    const gallarys = await gallarysWithoutImages[0]?.photos?.map((photo) => {
      return {
        photos: photo ? `${baseUrl}/${photo.replace(/\\/g, "/")}` : "",
      };
    });

    const currentDate = new Date().toISOString();

    const ongoingCourses = await Course.find({
      trainer_id: { $in: trainerId },
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    })
      ?.sort({
        createdAt: -1,
      })
      .populate("trainer_id", "f_Name l_Name")
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
      trainer_id: { $in: trainerId },
      start_date: { $gt: currentDate },
    })
      .sort({
        createdAt: -1,
      })
      .populate("trainer_id", "f_Name l_Name")
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

    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 4;

    // const startIndex = (page - 1) * limit;

    // const result = await Course.find({
    //   category_id: course_data[0]?.category_id.id,
    // })
    //   .sort({ createdAt: -1 })
    //   .skip(startIndex)
    //   .limit(limit)
    //   .populate("category_id", "category_name")
    //   .populate("trainer_id", "f_Name l_Name");

    // if (!result || result.length === 0) {
    //   return res.status(404).json({ message: "Course not found" });
    // } else {
    //   const baseUrl = req.protocol + "://" + req.get("host");

    //   const relatedCourses = result.map((course) => ({
    //     ...course._doc,
    //     thumbnail_image: `${baseUrl}/${course.thumbnail_image.replace(
    //       /\\/g,
    //       "/"
    //     )}`,
    //     gallary_image: `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`,
    //     trainer_materialImage: `${baseUrl}/${course.trainer_materialImage.replace(
    //       /\\/g,
    //       "/"
    //     )}`,
    //   }));

    // }

    res.status(200).json({
      institutes,
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
      // courses: relatedCourses,
      OnGoingBatches,
      UpcomingBatches,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
});

module.exports = router;
