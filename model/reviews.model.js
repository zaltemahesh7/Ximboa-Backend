const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  review: { type: String, required: true },
  star_count: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },

  // Add replies array inside each review
  replies: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
        required: true,
      },
      reply: { type: String, required: true },
      repliedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = reviewSchema;
