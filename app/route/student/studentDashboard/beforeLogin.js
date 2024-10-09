const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category");
const Trainer = require("../../../../model/registration");

const Course = require("../../../../model/course");
const Event = require("../../../../model/event");
const Product = require("../../../../model/product");
const { ApiError } = require("../../../../utils/ApiError");
const registration = require("../../../../model/registration");
const InstituteModel = require("../../../../model/Institute/Institute.model");
const Review = require("../../../../model/Review");
const product = require("../../../../model/product");

router.get("/home", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;

    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrl = await Promise.all(
      courses.map((course) => {
        const reviews = course.reviews;
        const totalStars = reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating = totalStars / reviews.length;

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
      })
    );

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(9);

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category.category_name,
        Sub_title: category.sub_title,
        category_image: category.category_image
          ? `${baseUrl}/${category.category_image.replace(/\\/g, "/")}`
          : "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });

    const trainers = await Trainer.aggregate([
      {
        $match: {
          role: { $in: ["TRAINER", "SELF_EXPERT"] },
        },
      },
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
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const trainersWithFullImageUrl = await Promise.all(
      trainers.map(async (trainer) => {
        const institute = await InstituteModel.findOne({
          trainers: trainer._id,
        }).select("institute_name social_Media");

        const stcount = await Review.findOne({ t_id: trainer._id }).select(
          "star_count"
        );

        return {
          t_id: trainer?._id,
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
          ratings: stcount?.t_id?.star_count || "",
          trainer_image: trainer?.trainer_image
            ? `${baseUrl}/${trainer?.trainer_image?.replace(/\\/g, "/")}`
            : "",
        };
      })
    );

    // Fetch all products
    const products = await product
      .find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: "categoryid",
        select: "category_name",
        model: "Category",
      })
      .populate({
        path: "t_id",
        select: "role",
        model: "Registration",
      })
      // .populate({
      //   path: "reviews", // Assuming product has 'reviews' referencing the 'Reviews' model
      //   select: "star_count", // We only need the star count for rating
      //   model: "Review",
      // })
      .select(
        "product_image product_name product_selling_prize product_prize is_institute is_virtual"
      );

    const productDetails = products.map((product) => {
      let avgRating = 0;
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        avgRating = (totalRating / product.reviews.length).toFixed(1); // Optional: round to 1 decimal
      }

      return {
        _id: product?._id,
        productImage: product?.product_image
          ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
          : "",
        productName: product?.product_name || "",
        productPrice: product?.product_prize || "",
        productSellingPrice: product?.product_selling_prize || "",
        avgRating: avgRating || "",
        categoryName: product?.categoryid?.category_name || "",
        identityFlag: product?.t_id?.role,
        productFlag: product?.product_flag || "",
      };
    });

    // Fetch events from the Event model
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select(
        "event_thumbnail event_date event_name event_type event_start_time event_end_time"
      );

    const eventDetails = events.map((event) => {
      return {
        _id: event?._id,
        eventImage: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
        eventDate: event?.event_date || "",
        eventStartTime: event?.event_start_time || "",
        eventEndTime: event?.event_end_time || "",
        eventName: event?.event_name || "",
        mode: event?.event_type === "Online" ? "Online" : "Offline",
        enrollments: event?.registered_users?.length,
      };
    });

    res.status(200).send({
      trainersWithFullImageUrl,
      categoriesWithFullImageUrl,
      coursesWithFullImageUrl,
      productDetails,
      eventDetails,
      // pagination: {
      //   currentPage: page,
      //   totalPages: Math.ceil(totalCourses / limit),
      //   totalItems: totalCourses,
      //   pageSize: limit,
      // },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err.message || "", err));
  }
});

// ========================-- allcategory ------------------------------=======
router.get("/allcategory", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const categories = await Category.find();

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category?.category_name,
        Sub_title: category?.sub_title,
        category_image: category?.category_image
          ? `${baseUrl}/${category?.category_image?.replace(/\\/g, "/")}`
          : "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });

    res.status(200).json(categoriesWithFullImageUrl);
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err?.message || "", err));
  }
});

// ====================================== all Courses ===================----------
router.get("/allcourses", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;
    const totalCourses = await Course.countDocuments();

    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image id city role");

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    // Map courses to include full image URLs
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
        course_flag:
          course?.trainer_id?.role === "TRAINER" ? "Institute" : "Self Expert",
      };
      return result;
    });

    res.status(200).send({
      coursesWithFullImageUrl,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(
        new ApiError(500, error.message || "Error fetching courses", error)
      );
  }
});

// ========================= All Trainers with pagination ====================================
router.get("/trainers", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    // Find all trainers with the role TRAINER or SELF_TRAINER and populate the categories array
    const trainers = await Trainer.aggregate([
      // Add $match to filter users by role
      {
        $match: {
          role: { $in: ["TRAINER", "SELF_EXPERT"] },
        },
      },
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
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count of trainers for pagination
    const totalTrainers = await registration.countDocuments({
      role: { $in: ["TRAINER", "SELF_TRAINER"] },
    });

    // Send the response
    res.status(200).json({
      trainers: await Promise.all(
        trainers.map(async (trainer) => {
          const institute = await InstituteModel.findOne({
            trainers: trainer._id,
          }).select("institute_name social_Media");

          return {
            _id: trainer?._id,
            Business_Name: institute
              ? institute?.institute_name
              : trainer?.business_Name ||
                trainer?.f_Name + " " + trainer?.l_Name,
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
      ),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTrainers / limit),
        totalItems: totalTrainers,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
});

router.get("/course/:id", async (req, res, next) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");

    const course = await Course.findOne({ _id: req.params.id })
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    const reviews = course.reviews;
    const totalStars = reviews.reduce(
      (sum, review) => sum + review.star_count,
      0
    );
    const averageRating = totalStars / reviews.length;

    const coursesWithFullImageUrl = {
      _id: course?._id,
      course_name: course?.course_name || "",
      course_brief_info: course?.course_brief_info || "",
      course_information: course?.course_information || "",
      category_name: course?.category_id?.category_name || "",
      online_offline: course?.online_offline || "",
      thumbnail_image: course?.thumbnail_image
        ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
        : "",
      start_date: course?.start_date || "",
      end_date: course?.end_date || "",
      start_time: course?.start_time || "",
      end_time: course?.end_time || "",
      business_Name: course?.trainer_id?.business_Name
        ? course?.trainer_id?.business_Name
        : `${course?.trainer_id?.f_Name || ""} ${
            course?.trainer_id?.l_Name || ""
          }`.trim() || "",
      trainer_image: course?.trainer_id?.trainer_image
        ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(/\\/g, "/")}`
        : "",
      trainer_id: course?.trainer_id?._id,
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;
    const result = await Course.find({
      category_id: course?.category_id?.id,
    })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    if (!result) return res.status(404).json({ message: "Course not found" });
    else {
      const relatedCourses = result.map((course) => {
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
      res.status(200).json({ course: coursesWithFullImageUrl, relatedCourses });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err?.message || "Error Getting Course and Related courses",
          err
        )
      );
  }
});

// ========================= event/:id ====================================
router.get("/event/:id", async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const eventWithFullImageUrls = await Event.findById(req.params.id)
      .populate(
        "trainerid",
        "f_Name l_Name trainer_image business_Name social_Media role"
      )
      .populate("event_category", "category_name");

    const courseCount = await Course.countDocuments({
      trainer_id: eventWithFullImageUrls?.trainerid,
    });

    const institute = await InstituteModel.findOne({
      trainers: eventWithFullImageUrls?.trainerid?._id,
    }).select("institute_name social_Media");

    const event = {
      _id: eventWithFullImageUrls?._id,
      event_thumbnail:
        `${baseUrl}/${eventWithFullImageUrls?.event_thumbnail?.replace(
          /\\/g,
          "/"
        )}` || "",
      event_info: eventWithFullImageUrls?.event_info || "",
      event_description: eventWithFullImageUrls?.event_description || "",
      event_date: eventWithFullImageUrls?.event_date || "",
      event_start_time: eventWithFullImageUrls?.event_start_time || "",
      event_end_time: eventWithFullImageUrls?.event_end_time || "",
      event_name: eventWithFullImageUrls?.event_name || "",
      event_category:
        eventWithFullImageUrls?.event_category.category_name || "",
      event_languages: eventWithFullImageUrls?.event_languages || "",
      estimated_seats: eventWithFullImageUrls?.estimated_seats || "",
      event_location: eventWithFullImageUrls?.event_location || "",
      event_type: eventWithFullImageUrls?.event_type || "",
      registered_users: eventWithFullImageUrls?.registered_users.length || "",
      trainer_image: eventWithFullImageUrls?.trainerid?.trainer_image
        ? `${baseUrl}/${eventWithFullImageUrls?.trainerid?.trainer_image?.replace(
            /\\/g,
            "/"
          )}`
        : "",
      trainer_id: eventWithFullImageUrls?.trainerid?._id,
      business_Name: eventWithFullImageUrls?.trainerid?.business_Name
        ? eventWithFullImageUrls?.trainerid?.business_Name
        : `${eventWithFullImageUrls?.trainerid?.f_Name || ""} ${
            eventWithFullImageUrls?.trainerid?.l_Name || ""
          }`.trim() || "",
      social_media: institute?.social_Media
        ? institute?.social_Media
        : eventWithFullImageUrls?.trainerid?.social_Media || "",
      trainier_rating: "Pending..###...",
      total_course: courseCount || "",
    };
    if (!event) {
      return res.status(404).json(new ApiError(404, "Event not found"));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;
    const result = await Event.find({
      event_category: eventWithFullImageUrls?.event_category?.id,
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("trainerid", "f_Name l_Name")
      .populate("event_category", "category_name");

    const relatedEvent = result.map((event) => ({
      _id: event?._id,
      event_name: event?.event_name || "",
      event_date: event?.event_date || "",
      event_type: event?.event_type || "",
      event_category: event?.event_category?.category_name || "",
      trainer_id: event?.trainerid?._id || "",
      registered_users: event?.registered_users.length || "",
      event_thumbnail: event?.event_thumbnail
        ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
        : "",
    }));
    res.status(200).json({ event, relatedEvent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// ========================= All Event ====================================
router.get("/allevents", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("event_category", "category_name -_id")
      .populate("trainerid", "f_Name l_Name");
    if (!events || events.length === 0) {
      return res.status(404).json(new ApiError(404, "Events not found"));
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
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating || "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail
          ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
          : "",
      };
      return result;
    });

    res.status(200).json(eventsWithThumbnails);
  } catch (err) {
    res
      .status(500)
      .json(new ApiError(500, err.message || "Error fetching Events", err));
  }
});

// ========================= product/:id ====================================
// Get a single product by ID
router.get("/product/:id", async function (req, res, next) {
  const baseUrl = req.protocol + "://" + req.get("host");

  const product = await Product.findOne({ _id: req.params.id })
    .populate("categoryid", "category_name")
    .populate("t_id", "f_Name l_Name business_Name role");

  const reviews = product.reviews;
  const totalStars = reviews.reduce(
    (sum, review) => sum + review.star_count,
    0
  );
  const averageRating = totalStars / reviews.length;

  const productDetail = {
    _id: product?._id,
    product_image: product?.product_image
      ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
      : "",
    products_info: product?.products_info || "",
    products_description: product?.products_description || "",
    products_rating: averageRating || "",
    products_category: product?.categoryid?.category_name || "",
    products_name: product?.product_name || "",
    products_price: product?.product_prize || "",
    products_selling_price: product?.product_selling_prize || "",
    business_Name: product?.t_id?.business_Name
      ? product?.t_id?.business_Name
      : `${product?.t_id?.f_Name || ""} ${
          product?.t_id?.l_Name || ""
        }`.trim() || "",
    identityFlag:
      product?.t_id?.role === "TRAINER" ? "Institute" : "Self Expert",
    product_flag: product?.product_flag || "",
    traienrid: product?.t_id?._id,
  };
  if (!product) {
    return res.status(404).json(new ApiError(404, "Event not found"));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  const startIndex = (page - 1) * limit;
  const result = await Product.find({
    categoryid: product?.categoryid?._id,
  })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("t_id", "_id f_Name l_Name")
    .populate("categoryid", "category_name");

  if (!result)
    return res.status(404).json({ message: "Related Products not found" });
  const relatedProducts = result?.map((product) => {
    const reviews = product.reviews;
    const totalStars = reviews.reduce(
      (sum, review) => sum + review.star_count,
      0
    );
    const averageRating = totalStars / reviews.length;

    const result = {
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
    return result;
  });
  res.status(200).json({ productDetail, relatedProducts });
});

// Get a single product by ID
router.get("/allproduct", async function (req, res, next) {
  const baseUrl = req.protocol + "://" + req.get("host");
  Product.find()
    .sort({ createdAt: -1 })
    .populate("categoryid", "category_name")
    .populate("t_id", "f_Name l_Name role")
    .then((result) => {
      const productsWithFullImageUrls = result.map((product) => {
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
      // console.log(productsWithFullImageUrls),
      res.status(200).json({ productsWithFullImageUrls });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json(
          new ApiError(
            500,
            err.message || "Server Error Gretting all Products",
            err
          )
        );
    });
});

module.exports = router;
