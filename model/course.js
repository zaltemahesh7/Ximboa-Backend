const mongoose = require("mongoose");

const courseShema = new mongoose.Schema({
  course_name: {
    type: String,
    required: true,
  },
  online_offline: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  offer_prize: String,
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
  course_information: {
    type: String,
    required: true,
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
});

module.exports = mongoose.model("Course", courseShema);
