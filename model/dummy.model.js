const mongoose = require("mongoose");

const dummySchema = new mongoose.Schema(
  {
    photos: [String], // Array of strings to store image paths or filenames
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    }, // Reference to Trainer
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", dummySchema);
