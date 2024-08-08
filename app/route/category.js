const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../../model/category");
const multer = require("multer");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Ensuring unique filenames
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: fileFilter,
});

// GET route to fetch all categories
// router.get("/", async (req, res, next) => {
//     try {
//         const categories = await Category.find();
//         res.status(200).json({
//             categories: categories
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             error: err.message
//         });
//     }
// });

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find();
    const baseUrl = req.protocol + "://" + req.get("host");

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category.category_name,
        category_image: category.category_image
          ? `${baseUrl}/${category.category_image.replace(/\\/g, "/")}`
          : "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });

    res.status(200).json({
      categories: categoriesWithFullImageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST route to create a new category
router.post("/", upload.single("category_image"), async (req, res, next) => {
  try {
    const existingCategory = await Category.findOne({
      category_name: req.body.category_name,
    });
    if (existingCategory) {
      return res.status(400).json({
        message: "Category name already exists",
      });
    }

    const category = new Category({
      _id: new mongoose.Types.ObjectId(),
      category_name: req.body.category_name,
      category_image: req.file ? req.file.path : "",
      trainer_id: req.body.trainer_id, // Assuming trainer_id is passed in the request body
    });

    const result = await category.save();
    res.status(201).json({
      newCategory: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET route to fetch a category by ID
router.get("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({
      category: category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// DELETE route to delete a category by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Category.deleteOne({ _id: req.params.id });
    res.status(200).json({
      msg: "Category data successfully deleted",
      result: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// PUT route to update a category by ID
router.put("/:id", upload.single("category_image"), async (req, res, next) => {
  try {
    const updateOps = {
      category_name: req.body.category_name,
      category_image: req.file ? req.file.path : "",
      trainer_id: req.body.trainer_id, // Assuming trainer_id is passed in the request body
    };

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateOps },
      { new: true }
    );
    res.status(200).json({
      msg: "Updated data successfully",
      updatedCategory: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET route to fetch categories by trainer ID
router.get("/BytrainerID/:trainerId", async (req, res, next) => {
  try {
    const categories = await Category.find({
      trainer_id: req.params.trainerId,
    }).populate("trainer_id");
    if (categories.length === 0) {
      return res
        .status(404)
        .json({ message: "No categories found for this trainer ID" });
    }
    res.status(200).json({
      categories: categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
