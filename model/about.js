var mongoose = require("mongoose");

var aboutSchema = new mongoose.Schema(
  {
    about_us: { type: String, trim: true },
    our_services: String,
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", aboutSchema);
