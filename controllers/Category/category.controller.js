const Category = require("../../model/category");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

// Controller to Add a New Category
exports.addCategory = async (req, res) => {
  try {
    const { category_name, sub_title, category_image } = req.body;
    const trainer_id = req.user.id;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ category_name });
    if (existingCategory) {
      return res
        .status(400)
        .json(new ApiError(400, "Category with this name already exists"));
    }

    // Create a new category
    const category = new Category({
      category_name,
      sub_title,
      trainer_id,
      category_image,
    });

    await category.save();

    res.status(201).json(
      new ApiResponse(201, "Category added successfully", {
        category: category.category_name,
      })
    );
  } catch (error) {
    console.error("Error adding category:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error while adding category", error));
  }
};

// Controller to Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find().populate(
      "trainer_id",
      "f_Name l_Name email_id"
    );

    if (!categories || categories.length === 0) {
      return res.status(404).json(new ApiError(404, "No categories found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "Categories retrieved successfully", {
        categories,
      })
    );
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error while retrieving categories", error));
  }
};
