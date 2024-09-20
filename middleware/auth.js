const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError");

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token Not Found" });

  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "bhojsoft");

    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json(new ApiError(400, err.message, err));
  }
};

const generateSessionId = () => {
  return require("crypto").randomBytes(16).toString("hex");
};

const generateToken = (userData, req) => {
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  const sessionId = generateSessionId();

  const payload = {
    ...userData,
    userAgent,
    ipAddress,
    sessionId,
  };

  return jwt.sign(payload, "bhojsoft");
};

module.exports = { jwtAuthMiddleware, generateToken };
