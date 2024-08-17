var mongoose = require("mongoose");

var educationSchema = new mongoose.Schema({
  school: String,
  college: String,
  degree: String,
  university: String,
  other_details: String,
  achievements: String,
  trainer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  }, // Reference to Trainer model
});

module.exports = mongoose.model("Education", educationSchema);
