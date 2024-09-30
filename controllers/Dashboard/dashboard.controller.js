const Course = require("../../model/course");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

const dashboard = async (req, res) => {
  try {
    const userid = req.user.id;
    const course_count = await Course.countDocuments({ trainer_id: userid });

    res
      .status(200)
      .json(
        new ApiResponse(200, "Getting Data success", {
          course_count,
          userid,
        })
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Error Getting Data", error));
  }
};

module.exports = { dashboard };
