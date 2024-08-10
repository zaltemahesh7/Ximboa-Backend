const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    email_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Token = mongoose.model("Token", TokenSchema);
module.exports = Token;
