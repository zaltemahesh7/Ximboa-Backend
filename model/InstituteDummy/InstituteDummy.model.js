const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for a dummy institute collection
const InstituteDummySchema = new Schema(
  {
    institute_name: {
      type: String,
      required: [true, "Institute name is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    Email: {
      type: String,
    },
    Website: {
      type: String,
    },
    About: {
      type: String,
    },
    Facebook: {
      type: String,
    },
    Twitter: {
      type: String,
    },
    Instagram: {
      type: String,
    },
    Phone_No: {
      type: Number,
    },
    courses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Course",
      //   required: [true, "At least one course is required"],
      //   validate: {
      //     validator: (arr) => arr.length > 0,
      //     message: "Courses cannot be empty",
      //   },
    },
    establishedYear: {
      type: Number,
      required: [true, "Established year is required"],
      min: [1900, "Established year must be after 1900"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
    institute_photos: {
      type: [String],
      //   validate: {
      //     validator: (arr) => arr.length <= 10,
      //     message: "Cannot upload more than 10 photos",
      //   },
    },
    isVerifiedBySuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("InstituteDummy", InstituteDummySchema);
