const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enquirySchema = new Schema(
  {
    t_id: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    u_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }, // Assuming you have a User model
  },
  { timestamps: true }
);

const Enquiry = mongoose.model("Enquiry", enquirySchema);
module.exports = Enquiry;
