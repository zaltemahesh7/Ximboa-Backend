var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  t_id: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
  Product_name: String,
  Product_Prize: Number,
  Product_Selling_Prize: Number,
  Products_info: String,
  product_image: String,
  product_gallary: String,
});

module.exports = mongoose.model("Product", productSchema);
