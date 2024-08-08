var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  t_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  },
  product_name: String,
  product_Prize: Number,
  product_Selling_Prize: Number,
  products_info: String,
  product_image: String,
  product_gallary: String,
});

module.exports = mongoose.model("Product", productSchema);
