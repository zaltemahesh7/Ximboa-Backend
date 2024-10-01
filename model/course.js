const mongoose = require("mongoose");

const courseShema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: [true, "Course Name is Required"],
    },
    online_offline: {
      type: String,
      required: [true, "Course Mode is Required (Online/Offline"],
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
    course_information: {
      type: String,
      required: [true, "Course Course Information is Required"],
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
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseShema);
