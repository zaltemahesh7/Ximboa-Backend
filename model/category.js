// Category model
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category_name: {
    type: String,
    required: true,
    unique: true, // Ensure the category name is unique
  },
  trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
  category_image: String,
});

module.exports = mongoose.model("Category", categorySchema);
