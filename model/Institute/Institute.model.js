const mongoose = require("mongoose");
const { Schema } = mongoose;

const instituteSchema = new Schema(
  {
    institute_name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration", // Refers to the admin who created the institute
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration", // Refers to the admin who last updated the institute
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration", // Multiple admins related to the institute
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration", // Trainers connected to the institute
      },
    ],
    institute_photos: [{ type: String }], // Array to store paths to institute photos
    isVerifiedBySuperAdmin: {
      type: Boolean,
      default: false, // Indicates if the institute is verified by super admin
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Institute", instituteSchema);
