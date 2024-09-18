const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    Testimonial_Title: {
      type: String,
      required: true,
    },
    Testimonial_Description: {
      type: String,
      required: true,
    },
    Testimonial_Autor_Name: String,
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
