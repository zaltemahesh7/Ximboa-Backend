var express = require("express");
var app = express();
var cors = require("cors");
const path = require("path");

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

var registerRoute = require("./app/route/registration");
app.use("/registration", registerRoute);

var trainerINfoRoute = require("./app/route/trainerInfo");
app.use("/trainerINfo", trainerINfoRoute);

var aboutRoute = require("./app/route/about");
app.use("/about", aboutRoute);

var batchRoute = require("./app/route/batch");
app.use("/batch", batchRoute);

var educationRoute = require("./app/route/education");
app.use("/education", educationRoute);

var eventSchema = require("./app/route/event");
app.use("/event", eventSchema);

var gallaryRoute = require("./app/route/gallary");
app.use("/gallary", gallaryRoute);

var productRoute = require("./app/route/product");
app.use("/product", productRoute);

var socialMediaSchema = require("./app/route/socialMedia");
app.use("/socialMedia", socialMediaSchema);

var testemonialRoute = require("./app/route/testemonial");
app.use("/testmonial", testemonialRoute);

var allDataRoute = require("./app/route/trainner");
app.use("/", allDataRoute);

var postallDataRoute = require("./app/route/postAllData");
app.use("/postCombineData", postallDataRoute);

var categoryRoute = require("./app/route/userRoute/category");
app.use("/category", categoryRoute);

var courseRoute = require("./app/route/userRoute/course");
app.use("/course", courseRoute);

var appointmentRoute = require("./app/AppointmentRoute");
app.use("/appointment", appointmentRoute);

var ReviewRoute = require("./app/route/ReviewRoute");
app.use("/review", ReviewRoute);

var QuestionsRoute = require("./app/route/QuestionsRoute/Questions");
app.use("/questions", QuestionsRoute);

var TrainerRoute = require("./app/route/trainner");
app.use("/trainers", TrainerRoute);

var EnquirysRoute = require("./app/route/Enquirys");
app.use("/enquiries", EnquirysRoute);

var mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/bhoj_soft_solution")
  .then(function () {
    console.log("connection successful");
  })
  .catch(function () {
    console.log("failed");
  });

// app.use((req, res, next) => {
//   res.status(200).json({
//     message: "app is running",
//   });
// });

module.exports = app;


// Test new changes