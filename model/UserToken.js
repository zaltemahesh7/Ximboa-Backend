const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration", // Reference to the user collection
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token will be automatically removed after 1 hour
  },
});

const UserToken = mongoose.model("UserToken", UserTokenSchema);

module.exports = UserToken;
