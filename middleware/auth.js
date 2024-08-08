const jwt = require("jsonwebtoken");
const Student = require("../model/Student/Student"); // Assuming Student model is in models directory

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "your_jwt_secret");
    const user = await Student.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = auth;
