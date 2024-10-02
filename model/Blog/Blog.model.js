// models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"] },
  content: { type: String, required: [true, "Title is content"] },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: [true, "Please Login."],
  },
  photo: { type: String },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      comment: String,
    },
  ],
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: "Registration" },
});

module.exports = mongoose.model("Post", postSchema);
