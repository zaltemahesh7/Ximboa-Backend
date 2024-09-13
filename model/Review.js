const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    t_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    c_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    review: { type: String, required: true },
    star_count:{ type:Number, require:true}
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
