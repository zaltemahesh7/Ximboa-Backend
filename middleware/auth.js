const jwt = require("jsonwebtoken");

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
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Function to generate JWT token
const generateToken = (userData) => {
  // Generate a new JWT token using user data
  return jwt.sign(userData, "bhojsoft", { expiresIn: 30000 });
};

module.exports = { jwtAuthMiddleware, generateToken };

// const jwt = require("jsonwebtoken");
// const Trainer = require("../model/registration"); // Assuming Trainer model is in models directory

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header("x-auth-token").replace("Bearer ", "");
//     // const token = req.cookies.jwtoken;
//     console.log(token);

//     const decoded = jwt.verify(token, "bhojsoft");
//     const user = await Trainer.findById(decoded.id);

//     if (!user) {
//       throw new Error("User Not Found");
//     }
//     // req.token = token;
//     // req.rootUser = rootUser;
//     // req.userId = rootUser._id;
//     // console.log(req.rootUser);

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(401).json({ message: error });
//   }
// };

// module.exports = auth;
