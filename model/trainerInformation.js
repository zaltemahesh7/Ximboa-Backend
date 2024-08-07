var mongoose = require("mongoose");

var trainerinfoSchema = new mongoose.Schema({
  trainer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  trainer_name: String,
  trainer_whatsapp_no: String,
  date_of_birth: String,
  rating: String,
  rating_count: String,
  address1: String,
  address2: String,
  city: String,
  country: String,
  state: String,
  pincode: String,
  trainer_image: String,
});

module.exports = mongoose.model("TrainerINfo", trainerinfoSchema);
