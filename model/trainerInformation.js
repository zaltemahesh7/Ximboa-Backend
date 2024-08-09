var mongoose = require("mongoose");

var trainerinfoSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  email_id: String,
  mobile_number: String,
  trainer_image: String,
  date_of_birth: String,
  rating: String,
  rating_count: String,
  address1: String,
  address2: String,
  city: String,
  country: String,
  state: String,
  pincode: String,
});

module.exports = mongoose.model("TrainerINfo", trainerinfoSchema);
