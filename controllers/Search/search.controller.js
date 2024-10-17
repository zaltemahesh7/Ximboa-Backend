const Course = require("../../model/course");
const Registration = require("../../model/registration");
const Product = require("../../model/product");
const Event = require("../../model/event");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

const globalSearch = async (req, res) => {
  const searchTerm = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = (page - 1) * limit;

  // Validate search term length
  if (!searchTerm || searchTerm.length < 3) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Search term must be at least 3 characters long.")
      );
  }

  try {
    // Use a regex for search term (case-insensitive)
    const searchRegex = new RegExp(searchTerm, "i");

    // Exact match query to improve performance
    const exactMatchQuery = {
      $or: [
        { course_name: searchTerm },
        { description: searchTerm },
        { tags: searchTerm },
      ],
    };

    // Fallback regex search query
    const regexQuery = {
      $or: [
        { course_name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
      ],
    };

    // Fetch data from multiple collections using optimized queries
    const [courses, trainers, products, events] = await Promise.all([
      // Search Courses
      Course.find(exactMatchQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .populate("category_id", "category_name")
        .select("course_name thumbnail_image")
        .then((courses) =>
          courses.length
            ? courses
            : Course.find(regexQuery)
                .limit(limit)
                .skip(skip)
                .lean()
                .populate("category_id", "category_name")
                .select("course_name thumbnail_image")
        ),

      // Search Trainers
      Registration.find({
        role: { $in: ["TRAINER", "SELF_EXPERT"] },
        $or: [
          { f_Name: searchRegex },
          { l_Name: searchRegex },
          { business_Name: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .populate("categories", "category_name")
        .limit(limit)
        .skip(skip)
        .lean()
        .select("f_Name l_Name trainer_image business_Name"),

      // Search Products
      Product.find({
        $or: [
          { product_name: searchRegex },
          { product_description: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .populate("categoryid", "category_name")
        .limit(limit)
        .skip(skip)
        .lean()
        .select("product_name product_image product_description"),

      // Search Events
      Event.find({
        $or: [{ event_name: searchRegex }, { event_description: searchRegex }],
      })
        .sort({ createdAt: -1 })
        .populate("event_category", "category_name")
        .limit(limit)
        .skip(skip)
        .lean()
        .select("event_name event_thumbnail event_description"),
    ]);

    const baseUrl = req.protocol + "://" + req.get("host");

    // Format the response for each type of data
    const formattedCourses = courses.map((course) => ({
      _id: course?._id,
      course_name: course?.course_name,
      thumbnail_image: course?.thumbnail_image
        ? `${baseUrl}/${course?.thumbnail_image.replace(/\\/g, "/")}`
        : "",
      category_name: course?.category_id?.category_name || null,
    }));

    const formattedTrainers = trainers.map((trainer) => ({
      _id: trainer?._id,
      business_Name: trainer?.business_Name,
      f_Name: trainer?.f_Name,
      l_Name: trainer?.l_Name,
      trainer_image: trainer?.trainer_image
        ? `${baseUrl}/${trainer?.trainer_image.replace(/\\/g, "/")}`
        : "",
      trainer_categories: trainer?.categories.map(
        (category) => category.category_name
      ),
    }));

    const formattedProducts = products.map((product) => ({
      _id: product?._id,
      product_name: product?.product_name,
      product_image: product?.product_image
        ? `${baseUrl}/${product?.product_image.replace(/\\/g, "/")}`
        : "",
      product_description: product?.product_description,
      category: product?.categoryid?.category_name,
    }));

    const formattedEvents = events.map((event) => ({
      _id: event?._id,
      event_name: event?.event_name,
      event_image: event?.event_thumbnail
        ? `${baseUrl}/${event?.event_thumbnail.replace(/\\/g, "/")}`
        : "",
      events_category: event?.event_category?.category_name,
    }));

    // Send formatted response
    res.status(200).json({
      Courses: formattedCourses,
      Trainers: formattedTrainers,
      Products: formattedProducts,
      Events: formattedEvents,
    });
  } catch (error) {
    console.error("Error in globalSearchOptimized:", error);
    res.status(500).json(new ApiError(500, "Server Error", error));
  }
};

const searchProductByName = async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  try {
    const { product_name } = req.query;

    if (!product_name) {
      return res
        .status(400)
        .json(new ApiError(400, "Product name is required"));
    }

    const totalProducts = await Product.countDocuments({
      product_name: { $regex: product_name, $options: "i" },
    });
    const products = await Product.find({
      product_name: { $regex: product_name, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("t_id", "f_Name l_Name role")
      .populate("categoryid", "category_name");

    if (!products || products.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No products found"));
    }

    const productDetails = products.map((product) => {
      let productRating = 0;
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        productRating = (totalRating / product.reviews.length).toFixed(1);
      }

      return {
        _id: product?._id,
        productImage: product?.product_image
          ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
          : "",
        productName: product?.product_name || "",
        productPrice: product?.product_prize || "",
        productSellingPrice: product?.product_selling_prize || "",
        avgRating: productRating || "",
        categoryName: product?.categoryid?.category_name || "",
        identityFlag: product?.t_id?.role || "",
        productFlag: product?.product_flag || "",
      };
    });

    res.status(200).json(
      new ApiResponse(200, "Product found", productDetails, {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalItems: totalProducts,
        pageSize: limit,
      })
    );
  } catch (error) {
    console.error("Error searching for product:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error while searching for product", error));
  }
};

// Controller to Search Courses by Name
const searchCourseByName = async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  try {
    const { course_name } = req.query;

    if (!course_name) {
      return res.status(400).json(new ApiError(400, "Course name is required"));
    }

    const totalCourses = await Course.countDocuments({
      course_name: { $regex: course_name, $options: "i" },
    });
    const courses = await Course.find({
      course_name: { $regex: course_name, $options: "i" }, // 'i' makes it case-insensitive
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("trainer_id", "business_Name f_Name l_Name trainer_image role")
      .populate("category_id", "category_name");

    if (!courses || courses.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No courses found"));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        "Courses found",
        courses.map((course) => {
          return {
            _id: course?._id,
            course_name: course?.course_name || "",
            category_name: course?.category_id?.category_name || "",
            online_offline: course?.online_offline || "",
            thumbnail_image: course?.thumbnail_image
              ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
              : "",
            business_Name: course?.trainer_id?.business_Name
              ? course?.trainer_id?.business_Name
              : `${course?.trainer_id?.f_Name || ""} ${
                  course?.trainer_id?.l_Name || ""
                }`.trim() || "",
            trainer_image: course?.trainer_id?.trainer_image
              ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
                  /\\/g,
                  "/"
                )}`
              : "",
            course_rating: "",
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
        }),
        {
          currentPage: page,
          totalPages: Math.ceil(totalCourses / limit),
          totalItems: totalCourses,
          pageSize: limit,
        }
      )
    );
  } catch (error) {
    console.error("Error searching for course:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error while searching for course", error));
  }
};

const searchEventByName = async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  try {
    const { event_name } = req.query;

    if (!event_name) {
      return res.status(400).json(new ApiError(400, "Event name is required"));
    }

    const totalEvents = await Event.countDocuments({
      event_name: { $regex: event_name, $options: "i" },
    });
    const events = await Event.find({
      event_name: { $regex: event_name, $options: "i" }, // 'i' makes it case-insensitive
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("trainerid", "business_Name f_Name l_Name trainer_image role")
      .populate("event_category", "category_name");

    if (!events || events.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No events found"));
    }

    const eventsWithThumbnails = events.map((event) => {
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
        event_flag: event?.trainerid?.role || "",
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating || "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
      };
      return result;
    });

    res.status(200).json(
      new ApiResponse(200, "Events found", eventsWithThumbnails, {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / limit),
        totalItems: totalEvents,
        pageSize: limit,
      })
    );
  } catch (error) {
    console.error("Error searching for course:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error while searching for course", error));
  }
};

const searchTrainerByName = async (req, res) => {
  const { page = 1, limit = 10, trainer_name } = req.query;
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const searchQuery = trainer_name
      ? {
          $or: [
            { f_Name: { $regex: trainer_name, $options: "i" } },
            { l_Name: { $regex: trainer_name, $options: "i" } },
          ],
          role: { $in: ["TRAINER", "SELF_EXPERT"] },
        }
      : { role: { $in: ["TRAINER", "SELF_EXPERT"] } };

    const trainers = await Registration.aggregate([
      { $match: searchQuery },
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
          business_Name: 1,
          f_Name: 1,
          l_Name: 1,
          trainer_image: 1,
          role: 1,
          course_count: { $size: "$courses" },
        },
      },
    ])
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalTrainers = await Registration.countDocuments(searchQuery);

    const trainerResults = await Promise.all(
      trainers.map(async (trainer) => {
        const institute = await InstituteModel.findOne({
          trainers: trainer._id,
        }).select("institute_name social_Media");

        return {
          _id: trainer?._id,
          Business_Name: institute
            ? institute?.institute_name
            : trainer?.business_Name || trainer?.f_Name + " " + trainer?.l_Name,
          f_Name: trainer?.f_Name,
          l_Name: trainer?.l_Name,
          role: trainer?.role,
          course_count: trainer?.course_count,
          social_Media: institute
            ? institute?.social_Media
            : trainer?.social_Media || "",
          ratings: "",
          trainer_image: trainer?.trainer_image
            ? `${baseUrl}/${trainer?.trainer_image?.replace(/\\/g, "/")}`
            : "",
        };
      })
    );

    // Send the response
    res.status(200).json({
      trainers: trainerResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTrainers / limit),
        totalItems: totalTrainers,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error("Error searching trainers:", err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
};

module.exports = {
  globalSearch,
  searchProductByName,
  searchCourseByName,
  searchEventByName,
  searchTrainerByName,
};
