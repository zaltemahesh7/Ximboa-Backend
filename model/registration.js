var mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var RegistrationSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    email_id: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
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
  },
  { timestamps: true }
);

// Hash password before saving
RegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
RegistrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Registration", RegistrationSchema);
