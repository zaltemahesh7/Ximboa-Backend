const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    t_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    categoryid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    product_name: {
      type: String,
      required: true,
    },
    product_prize: {
      type: Number,
    },
    product_selling_prize: {
      type: Number,
    },
    products_info: {
      type: String,
    },
    product_flag: {
      type: String,
    },
    product_image: {
      type: String,
    },
    product_gallary: {
      type: String,
    },
    reviews: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Registration",
          required: true,
        },
        review: { type: String, required: true },
        star_count: { type: Number, require: true },
        addedAt: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
