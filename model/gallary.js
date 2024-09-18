const mongoose = require("mongoose");

const gallerySchema = mongoose.Schema(
  {
    photos: [String], // Array of strings to store file paths
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    }, // Reference to Trainer
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
