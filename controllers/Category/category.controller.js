const Category = require("../../model/category");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

// Controller to Add a New Category
exports.addCategory = asyncHandler(async (req, res) => {
  try {
    const { category_name, sub_title } = req.body;
    const category_image = req.file ? req.file.path : ""; // Access the uploaded file

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
      category_image,
      trainer_id,
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
});

// Controller to Get All Categories
exports.getAllCategories = asyncHandler(async (req, res) => {
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
});

exports.updatedCategory = asyncHandler(async (req, res, next) => {
  try {
    const category_id = req.params.id;
    const { category_name, sub_title } = req.body;
    const category_image = req.file ? req.file.path : "";
    const trainer_id = req.user.id;
    const existing_category = await Category.findById(category_id);

    const updateOps = {
      category_name: category_name
        ? category_name
        : existing_category?.category_name,
      sub_title: sub_title ? sub_title : existing_category?.sub_title,
      category_image: category_image
        ? category_image
        : existing_category?.category_image,
      trainer_id,
    };

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateOps },
      { new: true }
    );
    if (!updatedCategory) res.status(400).json({ msg: "Not found" });
    else {
      res
        .status(201)
        .json(
          new ApiResponse(201, "Updated data successfully", updatedCategory)
        );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});
