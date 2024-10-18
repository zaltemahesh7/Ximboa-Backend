const mongoose = require("mongoose");
const reviewSchema = require("./reviews.model");

const courseShema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: [true, "Course Name is Required"],
      trim: true,
    },
    online_offline: {
      type: String,
      required: [true, "Course Mode is Required (Online/Offline"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Course Price is Required"],
    },
    offer_prize: String,
    start_date: {
      type: Date,
      required: [true, "Course Start Date is Required"],
    },
    end_date: {
      type: Date,
      required: [true, "Course End Date is Required"],
    },
    start_time: {
      type: String,
      required: [true, "Course Start Time is Required"],
    },
    end_time: {
      type: String,
      required: [true, "Course End Time is Required"],
    },
    course_brief_info: {
      type: String,
      required: [true, "Course Course course_brief_info is Required"],
      trim: true,
    },
    course_information: {
      type: String,
      trim: true,
    },
    thumbnail_image: {
      type: String,
    },
    gallary_image: {
      type: String,
    },
    trainer_materialImage: {
      type: String,
    },
    tags: {
      type: String,
      trim: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseShema);
