var mongoose = require("mongoose");

var socialMediaSchema = new mongoose.Schema({
  Email_Id: String,
  facebook: String,
  instagram: String,
  youtube: String,
  Linkdein: String,
  trainer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  }, // Reference to Trainer
});

module.exports = mongoose.model("SocialMedia", socialMediaSchema);
