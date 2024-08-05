const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    // r_id: { type: String, required: true, unique: true },
    t_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    c_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    review: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;