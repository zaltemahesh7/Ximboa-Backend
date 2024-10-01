// const Course = require("../../model/course");
// const { ApiError } = require("../../utils/ApiError");
// const { ApiResponse } = require("../../utils/ApiResponse");

// const dashboard = async (req, res) => {
//   try {
//     const userid = req.user.id;
//     const role = req.user.role;
//     const course_created = await Course.countDocuments({ trainer_id: userid });

//     res.status(200).json(
//       new ApiResponse(200, "Getting Data success", {
//         course_created: course_created,
//         userid,
//       })
//     );
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json(new ApiError(500, error.message || "Error Getting Data", error));
//   }
// };

// module.exports = { dashboard };

const Course = require("../../model/course");
const Event = require("../../model/event");
const Product = require("../../model/product");
const Enrollment = require("../../model/Student/Enrollment"); // Assuming you have an enrollment model
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

// Controller to get dashboard statistics for the logged-in user
exports.getDashboardCountsForUser = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is stored in req.user after authentication
    const userRole = req.user.role; // Assuming role is stored in req.user after authentication

    let dashboardData = {};

    // If user is a trainer or part of the institute, show course, event, and product counts they own
    if (
      userRole === "TRAINER" ||
      userRole === "SELF_TRAINER" ||
      userRole === "INSTITUTE"
    ) {
      // Get total course count associated with the logged-in user
      const totalCourses = await Course.countDocuments({ trainer_id: userId });

      // Get total event count associated with the logged-in user
      const totalEvents = await Event.countDocuments({ trainerid: userId });

      // Get total product count associated with the logged-in user (assuming products are linked to the user)
      const totalProducts = await Product.countDocuments({ owner_id: userId });

      dashboardData = {
        totalCourses,
        totalEvents,
        totalProducts,
      };
    } else {
      // If user is not a trainer or institute, show enrolled course count, registered events, and purchased products
      const enrolledCourses = await Enrollment.countDocuments({
        user_id: userId,
      });
      const registeredEvents = await Event.countDocuments({
        registered_users: userId,
      });
      const purchasedProducts = await Product.countDocuments({
        purchased_by: userId,
      });

      dashboardData = {
        enrolledCourses,
        registeredEvents,
        purchasedProducts,
      };
    }

    // Return success response with the dashboard data
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Dashboard data fetched successfully",
          dashboardData
        )
      );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json(new ApiError(500, "Error fetching dashboard data", error));
  }
};
