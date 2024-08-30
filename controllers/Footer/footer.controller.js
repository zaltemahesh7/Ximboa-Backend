const Registration = require("../../model/registration");
const Categories = require("../../model/category");
const { ApiResponse } = require("../../utils/ApiResponse");

const categoriesDataFooter = async (req, res) => {
  const categories = await Categories.find("category_name");
  res.status(200).json(new ApiResponse(200, "Category data", categories));
};

module.exports = { categoriesDataFooter };
