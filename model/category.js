// // Category model
// const mongoose = require("mongoose");

// const categorySchema = new mongoose.Schema(
//   {
//     category_name: {
//       type: String,
//       required: true,
//       unique: true, // Ensure the category name is unique
//     },
//     sub_title: {
//       type: String,
//     },
//     trainer_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Registration",
//     },
//     category_image: String,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Category", categorySchema);




const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: [true, "Category name is required"], // Adding more detailed error messages
      unique: true, // Ensures uniqueness in the collection
      trim: true, // Removes leading/trailing spaces
      minlength: [2, "Category name must be at least 3 characters long"], // Minimum length validation
      maxlength: [50, "Category name must be less than 50 characters long"], // Maximum length validation
    },
    sub_title: {
      type: String,
      trim: true,
      maxlength: [100, "Sub title must be less than 100 characters"],
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: [true, "Trainer ID is required"],
    },
    category_image: {
      type: String,
      // validate: {
      //   validator: function (value) {
      //     // Check if the category image is a valid URL or path
      //     return (
      //       !value ||
      //       value.match(
      //         /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      //       )
      //     );
      //   },
      //   message: "Invalid category image URL or path",
      // },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook to handle any custom logic (optional, can be used for formatting)
categorySchema.pre("save", function (next) {
  if (this.category_image) {
    this.category_image = this.category_image.replace(/\\/g, "/");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
