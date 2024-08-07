const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  Batch_categories: String,
  batch_name: String,
  trainer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  },
  batch_image: String,
});

module.exports = mongoose.model("Batch", batchSchema);
