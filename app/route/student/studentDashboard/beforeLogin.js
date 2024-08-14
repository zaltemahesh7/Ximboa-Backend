const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category"); // Assuming you have a Category model
const Trainer = require("../../../../model/registration"); // Assuming you have a Category model

const Course = require("../../../../model/course");

// Get courses with specific fields, including trainer name populated
router.get("/", async (req, res) => {
  try {
    // Get page and limit from query parameters, set defaults if not provided
    const page = parseInt(req.query.page) || 1; // Default to first page
    const limit = parseInt(req.query.limit) || 10; // Default to 10 courses per page

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;

    // Fetch courses with pagination
    const courses = await Course.find()
      .skip(startIndex)
      .limit(limit)
      .populate("category_id").populate("trainer_id");

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    // Map courses to include full image URLs
    const coursesWithFullImageUrl = courses.map((course) => {
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
      };
    });

    const categories = await Category.find();

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category.category_name,
        category_image: category.category_image
          ? `${baseUrl}/${category.category_image.replace(/\\/g, "/")}`
          : "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });
    const trainers = await Trainer.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "trainer_id",
          as: "courses",
        },
      },
      {
        $project: {
          user_name: 1,
          trainer_image: 1,
          course_count: { $size: "$courses" },
        },
      },
    ]);

    const trainersWithFullImageUrl = trainers.map((trainer) => {
      return {
        user_name: trainer.user_name,
        course_count: trainer.course_count,
        trainer_image: trainer.trainer_image
          ? `${baseUrl}/${trainer.trainer_image.replace(/\\/g, "/")}`
          : "",
      };
    });

    res.status(200).send({
      trainersWithFullImageUrl,
      categoriesWithFullImageUrl,
      coursesWithFullImageUrl,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching courses", error });
  }
});

module.exports = router;

// router.get("/", async (req, res) => {
//   try {
//     const trainerId = req.user.id;

//     // Find the trainer
//     const trainer = await Trainer.findById(trainerId);
//     if (!trainer) {
//       return res.status(404).send({ message: "Trainer not found" });
//     }

//     // Find courses by the trainer
//     const courses = await Course.find();
//     const baseUrl = req.protocol + "://" + req.get("host");

//     const coursesWithFullImageUrl = courses.map((course) => {
//       return {
//         ...course._doc,
//         thumbnail_image: course.thumbnail_image
//           ? `${baseUrl}/${course.thumbnail_image.replace(/\\/g, "/")}`
//           : "",
//         gallary_image: course.gallary_image
//           ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
//           : "",
//         trainer_materialImage: course.gallary_image
//           ? `${baseUrl}/${course.gallary_image.replace(/\\/g, "/")}`
//           : "",
//       };
//     });

//     // Find question by the trainer
//     const question = await Question.find({ t_id: trainerId });
//     // Find Appointment by the trainer
//     const Appointments = await Appointment.find({ t_id: trainerId });
//     // Find Enquiry by the trainer
//     const Enquirys = await Enquiry.find({ t_id: trainerId });
//     // Find Products by the trainer
//     const Products = await Product.find({ t_id: trainerId });

//     const productsWithFullImageUrl = Products.map((product) => {
//       return {
//         ...product._doc,
//         product_image: product.product_image
//           ? `${baseUrl}/${product.product_image.replace(/\\/g, "/")}`
//           : "",
//         product_gallary: product.gallary_image
//           ? `${baseUrl}/${product.gallary_image.replace(/\\/g, "/")}`
//           : "",
//       };
//     });

//     // Find Events by the trainer
//     const Events = await Event.find({ trainerid: trainerId });

//     // Find About by the trainer
//     const About = await About1.find({ trainer: trainerId });

//     // Get reviews and groups for each course
//     const courseIds = courses.map((course) => course._id);
//     const reviews = await Review.find({ t_id: trainerId });

//     const Educations = await Education.find({ trainer_id: { $in: trainerId } });

//     const SocialMedias = await SocialMedia.find({
//       trainer_id: { $in: trainerId },
//     });

//     const testimonials = await testemonial.find({
//       trainer_id: { $in: trainerId },
//     });

//     const gallarysWithoutImages = await gallary.find({
//       trainer_id: { $in: trainerId },
//     });
//     const gallarys = gallarysWithoutImages.map((gallary) => {
//       return {
//         ...gallary._doc,
//         photos: gallary.photos
//           ? `${baseUrl}/${gallary.photos.map((i) => i.replace(/\\/g, "/"))}`
//           : "",
//       };
//     });

//     res.status(200).send({
//       trainer,
//       coursesWithFullImageUrl,
//       reviews,
//       question,
//       Appointments,
//       Enquirys,
//       productsWithFullImageUrl,
//       Events,
//       About,
//       Educations,
//       SocialMedias,
//       testimonials,
//       gallarys,
//     });
//   } catch (error) {
//     // console.log(error);

//     res.status(500).send({ message: "Server error", error });
//   }
// });
