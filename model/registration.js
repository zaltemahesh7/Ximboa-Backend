const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { UserRolesEnum, AvailableUserRoles } = require("../constants");
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
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Number,
    },
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
    return error;
  }
};

// Method to compare password
RegistrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * @Description Method responsible for generating tokens for email verification, password reset etc.
 */
RegistrationSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};
module.exports = mongoose.model("Registration", RegistrationSchema);
