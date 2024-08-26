const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var RegistrationSchema = new mongoose.Schema(
  {
    f_Name: {
      type: String,
      required: true,
      trim: true,
    },
    middle_Name: {
      type: String,
      trim: true,
    },
    l_Name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    whatsapp_no: {
      type: String,
    },
    email_id: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isTrainer: {
      type: Boolean,
      default: false,
    },
    trainer_image: String,
    date_of_birth: String,
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

RegistrationSchema.methods.AuthToken = async function () {
  try {
    let token = jwt.signin({ _id: this._id }, "bhojsoft");
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

// Method to compare password
RegistrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Registration", RegistrationSchema);
