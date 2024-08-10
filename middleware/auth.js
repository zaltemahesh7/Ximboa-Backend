const jwt = require("jsonwebtoken");
const Student = require("../model/registration"); // Assuming Student model is in models directory

const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token").replace("Bearer ", "");
    console.log(token);

    const decoded = jwt.verify(token, "bhojsoft");
    const user = await Student.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);

    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = auth;
