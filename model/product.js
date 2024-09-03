const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    t_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
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
    product_image: {
      type: String,
    },
    product_gallary: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
