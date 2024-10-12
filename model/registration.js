const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  UserRolesEnum,
  AvailableUserRoles,
  USER_TEMPORARY_TOKEN_EXPIRY,
} = require("../constants");
const InstituteModel = require("./Institute/Institute.model");

const RegistrationSchema = new mongoose.Schema(
  {
    business_Name: {
      type: String,
    },
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
    email_id: {
      type: String,
      lowercase: true,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    social_Media: {
      facebook: String,
      instagram: String,
      youtube: String,
      linkedin: String,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    whatsapp_no: {
      type: String,
    },
    date_of_birth: {
      type: Date,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    pincode: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: InstituteModel,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    requested_Role: {
      type: String,
      enum: [...AvailableUserRoles, ""],
    },
    trainer_image: String,
    requests: [
      {
        userid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Registration",
        },
        requestedRole: {
          type: String,
          enum: [...AvailableUserRoles, ""],
        },
        requestDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
    },

    resetPasswordToken: String,
    resetPasswordExpires: Number,
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
RegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to generate auth token using JWT
RegistrationSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, "bhojsoft", { expiresIn: "1h" });
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (error) {
    console.error(error);
    return error;
  }
};

// Method to compare candidate password with stored password
RegistrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate temporary token for actions like email verification or password reset
RegistrationSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

module.exports = mongoose.model("Registration", RegistrationSchema);
