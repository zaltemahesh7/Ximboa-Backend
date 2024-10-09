const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { jwtAuthMiddleware } = require("./middleware/auth");

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());

const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const adminRoutes = require("./app/adminRoutes/adminRoutes");
app.use("/admin", adminRoutes);

const axios = require("axios");

app.get("/api/linkedin/userinfo", async (req, res) => {
  const accessToken = req.headers["authorization"].split(" ")[1]; // Extract the token from the Authorization header

  try {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving user info");
  }
});

// Endpoint to get the access token
app.post("/api/linkedin/access-token", async (req, res) => {
  const { code } = req.body;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = "http://localhost:4200/auth/linkedin"; // Change to match your redirect

  console.log("Data", { clientId, clientSecret, redirectUri });

  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving access token");
  }
});

const enrollCourse = require("./app/route/student/enrollments");
app.use("/enrollcourse", jwtAuthMiddleware, enrollCourse);

const registerRoute = require("./app/route/registration");
app.use("/registration", registerRoute);

app.use("/admin", adminRoutes);

const aboutRoute = require("./app/route/about");
app.use("/about", jwtAuthMiddleware, aboutRoute);

const batchRoute = require("./app/route/batch");
app.use("/batch", jwtAuthMiddleware, batchRoute);

const educationRoute = require("./app/route/education");
app.use("/education", jwtAuthMiddleware, educationRoute);

const eventSchema = require("./app/route/event");
app.use("/event", jwtAuthMiddleware, eventSchema);

const gallaryRoute = require("./app/route/gallary");
app.use("/gallary", jwtAuthMiddleware, gallaryRoute);

const productRoute = require("./app/route/product");
app.use("/product", jwtAuthMiddleware, productRoute);

const socialMediaSchema = require("./app/route/socialMedia");
app.use("/socialMedia", jwtAuthMiddleware, socialMediaSchema);

const testemonialRoute = require("./app/route/testemonial");
app.use("/testmonial", jwtAuthMiddleware, testemonialRoute);

const allDataRoute = require("./app/route/trainner");
app.use("/", allDataRoute);

const videoRoutes = require("./app/route/video");
app.use("/videos", videoRoutes);

const postallDataRoute = require("./app/route/postAllData");
app.use("/postCombineData", postallDataRoute);

const categoryRoute = require("./app/route/category");
app.use("/category", jwtAuthMiddleware, categoryRoute);

const courseRoute = require("./app/route/course");
app.use("/course", jwtAuthMiddleware, courseRoute);

const appointmentRoute = require("./app/AppointmentRoute");
app.use("/appointment", jwtAuthMiddleware, appointmentRoute);

const ReviewRoute = require("./app/route/ReviewRoute");
app.use("/review", ReviewRoute);

const QuestionsRoute = require("./app/route/student/questions");
app.use("/questions", QuestionsRoute);

const TrainerRoute = require("./app/route/trainner");
app.use("/trainers", jwtAuthMiddleware, TrainerRoute);

const trainerINfoRoute = require("./app/route/trainerInfo");
app.use("/trainerINfo", trainerINfoRoute);

const trainerProfile = require("./app/route/Trainer/trainerProfile");
app.use("/trainerbyid", trainerProfile);

const EnquirysRoute = require("./app/route/Enquirys");
app.use("/enquiries", jwtAuthMiddleware, EnquirysRoute);

const beforeLoginRoutes = require("./app/route/student/studentDashboard/beforeLogin");
app.use("/beforeLogin", beforeLoginRoutes);

const footerRouter = require("./app/route/footer.router");
app.use("/footer", footerRouter);

const globalSearch = require("./app/route/Search/globleSearch.router");
app.use("/search", globalSearch);

const notificationRoutes = require("./app/route/Notification/Notification.router");
app.use("/notifications", notificationRoutes);

const institute = require("./app/route/Institute/Institute.router");
app.use("/institute", institute);

const cart = require("./app/route/Cart/Cart.router");
app.use("/cart", cart);

const forum = require("./app/route/Forum/Forum.router");
app.use("/forum", forum);

const blogs = require("./app/route/Blogs/blog.router");
app.use("/blog", blogs);

const afterLogin = require("./app/route/student/studentDashboard/afterLogin");
app.use("/", afterLogin);

const dummy = require("./app/route/dummy.routes");
app.use("/dummy", dummy);

// const mongoose = require("mongoose");
// mongoose
//   .connect("mongodb://127.0.0.1:27017/bhoj_soft_solution")
//   .then(function () {
//     console.log("connection successful");
//   })
//   .catch(function () {
//     console.log("failed");
//   });

module.exports = app;
