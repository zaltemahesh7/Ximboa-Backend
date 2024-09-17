const InstituteDummy = require("../../model/InstituteDummy/InstituteDummy.model");
const { ApiError } = require("../../utils/ApiError");

// Bulk insert controller for institutes
const bulkInsertInstitutes = async (req, res) => {
  try {
    const institutes = req.body.institutes;

    if (!institutes || institutes.length === 0) {
      return res.status(400).json({ message: "No institutes provided" });
    }

    const result = await InstituteDummy.insertMany(institutes);

    return res.status(201).json({
      message: "Institutes added successfully",
    });
  } catch (error) {
    console.error("Bulk insert error:", error);
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message | "An error occurred while inserting institutes",
          error
        )
      );
  }
};

module.exports = {
  bulkInsertInstitutes,
};
