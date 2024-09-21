const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Forum Schema
const ForumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    replies: [
      {
        content: {
          type: String,
          required: true,
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "Registration",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Forum", ForumSchema);
