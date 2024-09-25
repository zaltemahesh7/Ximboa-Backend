// utils/tokenHelper.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload, req) => {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  return token;
};

module.exports = { generateToken };
