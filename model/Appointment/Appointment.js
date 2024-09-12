const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    t_id: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    u_id: {
      type: Schema.Types.ObjectId,
<<<<<<< HEAD
      ref: "User",
    }, 
=======
      ref: "Registration",
    }, // Assuming you have a User model
>>>>>>> 9be3e31a4494abb2221b94cf7ac18ce41ac6def9
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
