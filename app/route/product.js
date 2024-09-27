var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Product = require("../../model/product");
const multer = require("multer");
const NotificationModel = require("../../model/Notifications/Notification.model");
const { ApiError } = require("../../utils/ApiError");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

// Insert data into database
router.post(
  "/",
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_gallary", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const product = new Product({
        t_id: req.user.id,
        categoryid: req.body.categoryid,
        product_name: req.body.product_name,
        product_prize: req.body.product_prize,
        product_selling_prize: req.body.product_selling_prize,
        products_info: req.body.products_info,
        product_flag: req.body.product_flag,
        product_image: req.files["product_image"]
          ? req.files["product_image"][0].path
          : "",
        product_gallary: req.files["product_gallary"]
          ? req.files["product_gallary"][0].path
          : "",
      });

      const result = await product.save();

      const notification = new NotificationModel({
        recipient: req.user.id,
        message: `Your product "${result.product_name}" has been added successfully.`,
        activityType: "PRODUCT_ADDED",
        relatedId: result._id,
      });

      await notification.save();

      res.status(200).json({
        newProduct: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }
);

router.get("/", function (req, res, next) {
  Product.find()
    .populate("categoryid", "category_name")
    .then((result) => {
      res.status(200).json({
        allProducts: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// Get a single product by ID
router.get("/:id", async function (req, res, next) {
  Product.findById(req.params.id)
    .populate("categoryid", "category_name")
    .select("-t_id")
    .then((result) => {
      const productsWithFullImageUrls = result.map((product) => ({
        ...product._doc,
        product_image: `http://${req.headers.host}/${product.product_image}`,
      }));
      // console.log(productsWithFullImageUrls),
      res.status(200).json(productsWithFullImageUrls[0]);
    })
    .catch((err) => {
      res
        .status(500)
        .json(
          new ApiError(
            500,
            err.message || "Server Error Gretting Product by Id",
            err
          )
        );
    });
});

router.delete("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const notification = new NotificationModel({
      recipient: req.user.id,
      message: `Your product "${deletedProduct.product_name}" has been deleted successfully.`,
      activityType: "PRODUCT_DELETED",
      relatedId: deletedProduct._id,
    });
    await notification.save();

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting the product" });
  }
});

// Update a product
router.put(
  "/:id",
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_gallary", maxCount: 1 },
  ]),
  async function (req, res, next) {
    try {
      const existingProduct = await Product.findById(req.params.id);
      if (!existingProduct) {
        return res.status(400).json({ msg: "Product not found" });
      }

      const updateData = {
        categoryid: req.body.categoryid || existingProduct.categoryid,
        product_name: req.body.product_name || existingProduct.product_name,
        product_prize: req.body.product_prize || existingProduct.product_prize,
        product_selling_prize:
          req.body.product_selling_prize ||
          existingProduct.product_selling_prize,
        products_info: req.body.products_info || existingProduct.products_info,
        product_flag: req.body.product_flag || existingProduct.product_flag,
        product_image: req.files["product_image"]
          ? req.files["product_image"][0].path
          : existingProduct.product_image,
        product_gallary: req.files["product_gallary"]
          ? req.files["product_gallary"][0].path
          : existingProduct.product_gallary,
        trainer_id: req.user.id,
      };

      const notification = new NotificationModel({
        recipient: req.user.id,
        message: `Your product "${updateData.product_name}" has been updated successfully.`,
        activityType: "PRODUCT_UPDATED",
        relatedId: existingProduct._id,
      });
      notification.save();

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      res.status(200).json({
        msg: "Product updated successfully",
        updatedProduct: product,
      });
    } catch (error) {
      res.status(500).json({ error: "Error updating product", details: error });
    }
  }
);

// Get products by trainer ID
router.get("/bytrainer", function (req, res, next) {
  Product.find({ trainer_id: req.user.id })
    .populate("categoryid", "category_name")
    .then((result) => {
      res.status(200).json({
        productsByTrainerId: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
