const Course = require("../../model/course");
const Registration = require("../../model/registration");
const Product = require("../../model/product");
const Event = require("../../model/event");
const { ApiError } = require("../../utils/ApiError");

const globalSearch = async (req, res) => {
  const searchTerm = req.query.q;

  // Validate search term length
  if (!searchTerm || searchTerm.length < 3) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Search term must be at least 3 characters long.")
      );
  }

  try {
    // Define a regex for search term (case-insensitive)
    const searchRegex = new RegExp(searchTerm, "i");

    const searchQuery = {
      $or: [
        { course_name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ],
    };

    const [
      unFormattedCourses,
      unFormattedTrainers,
      unFormattedProducts,
      unFormattedEvents,
    ] = await Promise.all([
      Course.find(searchQuery)
        .populate("category_id", "category_name")
        .limit(4)
        .select("course_name thumbnail_image"),

      Registration.find({
        role: { $in: ["TRAINER", "SELF_EXPERT"] },
        $or: [
          { f_Name: searchRegex },
          { l_Name: searchRegex },
          // { bio: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "categories",
          select: "category_name _id",
          model: "Category",
        })
        .limit(4)
        .select("f_Name l_Name trainer_image bio"),

      Product.find({
        $or: [
          { product_name: searchRegex },
          { product_description: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .populate("categoryid", "category_name")
        .limit(4)
        .select("product_name product_image product_description"),

      Event.find({
        $or: [{ event_name: searchRegex }, { event_description: searchRegex }],
      })
        .sort({ createdAt: -1 })
        .populate("event_category", "category_name")
        .limit(4)
        .select("event_name event_thumbnail event_description"),
    ]);
    const baseUrl = req.protocol + "://" + req.get("host");

    const Courses = unFormattedCourses.map((course) => ({
      _id: course?._id,
      course_name: course?.course_name,
      thumbnail_image: course?.thumbnail_image
        ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
        : "",
      description: course?.description,
      tags: course?.tags,
      category_name: course?.category_id
        ? course?.category_id?.category_name
        : null,
    }));

    const trainers = unFormattedTrainers.map((trainer) => ({
      _id: trainer?._id,
      f_Name: trainer?.f_Name,
      l_Name: trainer?.l_Name,
      trainer_image: trainer?.trainer_image
        ? `${baseUrl}/${trainer?.trainer_image?.replace(/\\/g, "/")}`
        : "",
      trainer_categories: trainer?.categories.map(
        (category) => category.category_name
      ),
    }));

    const products = unFormattedProducts.map((product) => ({
      _id: product?._id,
      product_name: product?.product_name,
      product_image: product?.product_image
        ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
        : "",
      product_description: product?.product_description,
      category: product?.categoryid?.category_name,
    }));

    const events = unFormattedEvents.map((event) => ({
      _id: event?._id,
      event_name: event?.event_name,
      event_image: event?.event_thumbnail
        ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
        : "",
      events_category: event?.event_category?.category_name,
    }));

    res.status(200).json({
      Courses,
      trainers,
      products,
      events,
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

module.exports = { globalSearch };
