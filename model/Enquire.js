const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enquirySchema = new Schema(
  {
    trainerid: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
    },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model("Enquiry", enquirySchema);
module.exports = Enquiry;
