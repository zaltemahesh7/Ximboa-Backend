// models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  photo: { type: String },
  comments: [{ username: String, comment: String }],
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Post", postSchema);
