const express = require("express");
const router = express.Router();
const Trainer = require("../../model/registration");
const Course = require("../../model/course");
const Review = require("../../model/Review");
const Question = require("../../model/Student/Question");
const Appointment = require("../../model/Appointment/Appointment");
const Enquiry = require("../../model/Enquire");
const Product = require("../../model/product");
const Event = require("../../model/event");
const About1 = require("../../model/about");
const Education = require("../../model/education");
const SocialMedia = require("../../model/socialMedia");
const testemonial = require("../../model/testemonial");
const gallary = require("../../model/gallary");
const { ApiError } = require("../../utils/ApiError");

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
    const courses = await Course.find({ trainer_id: trainerId })
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image id city role");
    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrl = courses.map((course) => {
      const reviews = course.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
      const result = {
        _id: course?._id,
        category_name: course?.category_id?.category_name || "",
        course_name: course?.course_name || "",
        online_offline: course?.online_offline || "",
        thumbnail_image: course?.thumbnail_image
          ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
          : "",
        trainer_image: course?.trainer_id?.trainer_image
          ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
              /\\/g,
              "/"
            )}`
          : "",
        trainer_id: course?.trainer_id?._id,
        business_Name: course?.trainer_id?.business_Name
          ? course?.trainer_id?.business_Name
          : `${course?.trainer_id?.f_Name || ""} ${
              course?.trainer_id?.l_Name || ""
            }`.trim() || "",
        course_rating: averageRating || "",
        course_duration: Math.floor(
          Math.round(
            ((course?.end_date - course?.start_date) /
              (1000 * 60 * 60 * 24 * 7)) *
              100
          ) / 100
        ),
        course_price: course?.price || "",
        course_offer_prize: course?.offer_prize || "",
        course_flag: course?.trainer_id?.role || "",
      };
      return result;
    });

    const question = await Question.find({ trainerid: trainerId });

    const Appointments = await Appointment.find({ t_id: trainerId });

    const Enquirys = await Enquiry.find({ trainerid: trainerId });

    const Products = await Product.find({ t_id: trainerId })
      .populate("categoryid", "category_name")
      .populate("t_id", "f_Name l_Name role");

    const productsWithFullImageUrl = Products.map((product) => {
      const reviews = product.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;

      const productData = {
        _id: product?._id,
        product_image: product?.product_image
          ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
          : "",
        products_category: product?.categoryid?.category_name || "",
        products_rating: averageRating || "",
        products_category: product?.categoryid?.category_name || "",
        products_name: product?.product_name || "",
        products_price: product?.product_prize || "",
        products_selling_price: product?.product_selling_prize || "",
        identityFlag:
          product?.t_id?.role === "TRAINER" ? "Institute" : "Self Expert",
        product_flag: product?.product_flag || "",
      };
      return productData;
    });

    // Find Events by the trainer
    const events = await Event.find({ trainerid: trainerId })
      .populate("event_category", "category_name -_id")
      .populate("trainerid", "f_Name l_Name");

    const eventsWithThumbnailUrl = events.map((event) => {
      const reviews = event.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;

      const result = {
        _id: event?._id,
        event_name: event?.event_name || "",
        event_date: event?.event_date || "",
        event_category: event?.event_category?.category_name || "",
        event_type: event?.event_type || "",
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating || "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
      };
      return result;
    });

    const onlineEvents = events.filter(
      (event) => event.event_type === "Online"
    );
    const onlineEventsThumbnailUrl = onlineEvents.map((event) => {
      const reviews = event.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;

      const result = {
        _id: event?._id,
        event_name: event?.event_name || "",
        event_date: event?.event_date || "",
        event_category: event?.event_category?.category_name || "",
        event_type: event?.event_type || "",
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating || "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
      };
      return result;
    });
    const offlienEvents = events.filter(
      (event) => event.event_type === "Offline"
    );
    const offlienEventsThumbnailUrl = offlienEvents.map((event) => {
      const reviews = event.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;

      const result = {
        _id: event?._id,
        event_name: event?.event_name || "",
        event_date: event?.event_date || "",
        event_category: event?.event_category?.category_name || "",
        event_type: event?.event_type || "",
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating || "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
      };
      return result;
    });

    // Find About by the trainer
    const About = await About1.find({ trainer: trainerId });

    // Get reviews and groups for each course
    // const courseIds = courses.map((course) => course._id);
    const reviewData = await Review.find({ t_id: trainerId }).populate(
      "user_id",
      "f_Name l_Name trainer_image"
    );
    console.log(reviewData);
    const reviews = reviewData.map((review) => {
      const result = {
        _id: review?._id || "",
        t_id: review?.t_id || "",
        user_id: review?.user_id?._id || "",
        user_name: review?.user_id?.f_Name
          ? `${review?.user_id?.f_Name} ${review?.user_id?.l_Name}`
          : "",
        trainer_image: review?.user_id?.trainer_image
          ? `${baseUrl}/${review?.user_id?.trainer_image?.replace(/\\/g, "/")}`
          : "",
        review: review?.review || "",
        star_count: review?.star_count || "",
        createdAt: review?.createdAt || "",
        updatedAt: review?.updatedAt || "",
      };
      return result;
    });

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
    const gallarys = await gallarysWithoutImages[0]?.photos?.map((photo) => {
      return {
        photos: photo ? `${baseUrl}/${photo}` : "",
      };
    });

    const currentDate = new Date().toISOString();

    const ongoingCourses = await Course.find({
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    })
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image id city role");

    // Map courses to include full image URLs and trainer name
    const OnGoingBatches = ongoingCourses.map((course) => {
      const reviews = course.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
      const result = {
        _id: course?._id,
        category_name: course?.category_id?.category_name || "",
        course_name: course?.course_name || "",
        online_offline: course?.online_offline || "",
        thumbnail_image: course?.thumbnail_image
          ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
          : "",
        trainer_image: course?.trainer_id?.trainer_image
          ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
              /\\/g,
              "/"
            )}`
          : "",
        trainer_id: course?.trainer_id?._id,
        business_Name: course?.trainer_id?.business_Name
          ? course?.trainer_id?.business_Name
          : `${course?.trainer_id?.f_Name || ""} ${
              course?.trainer_id?.l_Name || ""
            }`.trim() || "",
        course_rating: averageRating || "",
        course_duration: Math.floor(
          Math.round(
            ((course?.end_date - course?.start_date) /
              (1000 * 60 * 60 * 24 * 7)) *
              100
          ) / 100
        ),
        course_price: course?.price || "",
        course_offer_prize: course?.offer_prize || "",
        course_flag:
          course?.trainer_id?.role === "TRAINER" ? "Institute" : "Self Expert",
      };
      return result;
    });

    const upcomingCourses = await Course.find({
      start_date: { $gt: currentDate },
    })
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image id city role");

    // Map courses to include full image URLs and trainer name
    const UpcomingBatches = upcomingCourses.map((course) => {
      const reviews = course.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
      const result = {
        _id: course?._id,
        category_name: course?.category_id?.category_name || "",
        course_name: course?.course_name || "",
        online_offline: course?.online_offline || "",
        thumbnail_image: course?.thumbnail_image
          ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
          : "",
        trainer_image: course?.trainer_id?.trainer_image
          ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
              /\\/g,
              "/"
            )}`
          : "",
        trainer_id: course?.trainer_id?._id,
        business_Name: course?.trainer_id?.business_Name
          ? course?.trainer_id?.business_Name
          : `${course?.trainer_id?.f_Name || ""} ${
              course?.trainer_id?.l_Name || ""
            }`.trim() || "",
        course_rating: averageRating || "",
        course_duration: Math.floor(
          Math.round(
            ((course?.end_date - course?.start_date) /
              (1000 * 60 * 60 * 24 * 7)) *
              100
          ) / 100
        ),
        course_price: course?.price || "",
        course_offer_prize: course?.offer_prize || "",
        course_flag:
          course?.trainer_id?.role === "TRAINER" ? "Institute" : "Self Expert",
      };
      return result;
    });

    res.status(200).json({
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
      // OnGoingBatches,
      // UpcomingBatches,
    });
  } catch (error) {
    // console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
});

module.exports = router;
