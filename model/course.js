const mongoose = require("mongoose");

const courseShema = new mongoose.Schema({
  course_name: String,
  online_offline: String,
  price: String,
  offer_prize: String,
  start_date: String,
  end_date: String,
  start_time: String,
  end_time: String,
  course_information: String,
  thumbnail_image: String,
  gallary_image: String,
  trainer_materialImage: String,
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
