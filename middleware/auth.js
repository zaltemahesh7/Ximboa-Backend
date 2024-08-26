const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError");

// Browser specific token genration ============
// const crypto = require('crypto');

// function generateBrowserIdentifier() {
//   const userAgent = navigator.userAgent;
//   const randomString = crypto.randomBytes(16).toString('hex');
//   return crypto.createHash('sha256').update(userAgent + randomString).digest('hex');
// }

// const jwt = require('jsonwebtoken');

// function generateToken(user, browserIdentifier) {
//   const payload = {
//     userId: user.id,
//     browserId: browserIdentifier
//   };
//   return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1h' });
// }
// =========------------------=========

const jwtAuthMiddleware = (req, res, next) => {
  // first check request headers has authorization or not
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token Not Found" });

  // Extract the jwt token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, "bhojsoft");

    // Attach user information to the request object
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json(new ApiError(400, err.message, err));
  }
};

// Function to generate a unique session ID
const generateSessionId = () => {
  return require("crypto").randomBytes(16).toString("hex");
};

// Function to generate JWT token
const generateToken = (userData, req) => {
  // Extract the user agent and IP address from the request object
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  // Generate a unique session ID for this token
  const sessionId = generateSessionId();

  // Prepare the payload with user data and unique session identifiers
  const payload = {
    ...userData,
    userAgent,
    ipAddress,
    sessionId,
  };

  // Generate a new JWT token using the payload
  return jwt.sign(payload, "bhojsoft");
};

module.exports = { jwtAuthMiddleware, generateToken };
