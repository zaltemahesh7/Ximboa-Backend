var express = require("express");
var app = express();
var cors = require("cors");
const path = require("path");
const { jwtAuthMiddleware, generateToken } = require("./middleware/auth");

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());

var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

var session = require("express-session");

app.use(
  session({
    secret: "bhoj info solution",
    resave: true,
    saveUninitialized: true,
  })
);

const adminRoutes = require("./app/adminRoutes/adminRoutes");
app.use("/admin", adminRoutes); // Register auth routes

const authRoutes = require("./app/route/student/student");
app.use("/student", authRoutes); // Register auth routes

const enrollCourse = require("./app/route/student/enrollments");
app.use("/enrollcourse", jwtAuthMiddleware, enrollCourse); // Register auth routes

var registerRoute = require("./app/route/registration");
app.use("/registration", registerRoute);

var trainerINfoRoute = require("./app/route/trainerInfo");
app.use("/trainerINfo", trainerINfoRoute);

var aboutRoute = require("./app/route/about");
app.use("/about", jwtAuthMiddleware, aboutRoute);

var batchRoute = require("./app/route/batch");
app.use("/batch", jwtAuthMiddleware, batchRoute);

var educationRoute = require("./app/route/education");
app.use("/education", jwtAuthMiddleware, educationRoute);

var eventSchema = require("./app/route/event");
app.use("/event", jwtAuthMiddleware, eventSchema);

var gallaryRoute = require("./app/route/gallary");
app.use("/gallary", jwtAuthMiddleware, gallaryRoute);

var productRoute = require("./app/route/product");
app.use("/product", jwtAuthMiddleware, productRoute);

var socialMediaSchema = require("./app/route/socialMedia");
app.use("/socialMedia", jwtAuthMiddleware, socialMediaSchema);

var testemonialRoute = require("./app/route/testemonial");
app.use("/testmonial", jwtAuthMiddleware, testemonialRoute);

var allDataRoute = require("./app/route/trainner");
app.use("/", allDataRoute);

var videoRoutes = require("./app/route/video");
app.use("/videos", videoRoutes);

var postallDataRoute = require("./app/route/postAllData");
app.use("/postCombineData", postallDataRoute);

var categoryRoute = require("./app/route/category");
app.use("/category", jwtAuthMiddleware, categoryRoute);

var courseRoute = require("./app/route/course");
app.use("/course", jwtAuthMiddleware, courseRoute);

var appointmentRoute = require("./app/AppointmentRoute");
app.use("/appointment", jwtAuthMiddleware, appointmentRoute);

var ReviewRoute = require("./app/route/ReviewRoute");
app.use("/review", jwtAuthMiddleware, ReviewRoute);

var QuestionsRoute = require("./app/route/QuestionsRoute/Questions");
app.use("/questions", jwtAuthMiddleware, QuestionsRoute);

var TrainerRoute = require("./app/route/trainner");
app.use("/trainers", TrainerRoute);

var EnquirysRoute = require("./app/route/Enquirys");
app.use("/enquiries", jwtAuthMiddleware, EnquirysRoute);

const beforeLoginRoutes = require("./app/route/student/studentDashboard/beforeLogin");
app.use("/beforeLogin", beforeLoginRoutes);

var mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/bhoj_soft_solution")
  .then(function () {
    console.log("connection successful");
  })
  .catch(function () {
    console.log("failed");
  });

module.exports = app;

// Test new changes
