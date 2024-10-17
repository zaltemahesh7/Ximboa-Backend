const Course = require("../../model/course");
const Event = require("../../model/event");
const Product = require("../../model/product");
const Enrollment = require("../../model/Student/Enrollment");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

exports.getDashboardCountsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (
      userRole === "TRAINER" ||
      userRole === "SELF_TRAINER" ||
      userRole === "INSTITUTE"
    ) {
      const totalCourses = await Course.countDocuments({ trainer_id: userId });

      const totalEvents = await Event.countDocuments({ trainerid: userId });

      const totalProducts = await Product.countDocuments({ t_id: userId });

      dashboardData = {
        totalCourses,
        totalEvents,
        totalProducts,
      };
    } else {
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
