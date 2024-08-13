var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Product = require("../../model/product");
const multer = require("multer");

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
  (req, res, next) => {
    var product = new Product({
      t_id: req.user.id, // Don't pass Trainer id it will fetched from token payload
      product_name: req.body.product_name,
      product_prize: req.body.product_prize,
      product_selling_prize: req.body.product_selling_prize,
      products_info: req.body.products_info,
      product_image: req.files["product_image"]
        ? req.files["product_image"][0].path
        : "",
      product_gallary: req.files["product_gallary"]
        ? req.files["product_gallary"][0].path
        : "",
    });

    product
      .save()
      .then((result) => {
        res.status(200).json({
          newProduct: result,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err });
      });
  }
);

// Get all products
router.get("/", function (req, res, next) {
  Product.find()
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
router.get("/:id", function (req, res, next) {
  Product.findById(req.params.id)
    .then((result) => {
      res.status(200).json({
        product: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

// Delete a product
router.delete("/:id", function (req, res, next) {
  Product.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        msg: "Product deleted successfully",
        result: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
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
      const updateData = {
        product_name: req.body.product_name,
        product_prize: req.body.product_prize,
        product_selling_prize: req.body.product_selling_prize,
        products_info: req.body.products_info,
        product_image: req.body.product_image,
        trainer_id: req.user.id, // Update the trainer ID if needed
      };

      if (req.files["product_image"]) {
        updateData.product_image = req.files["product_image"][0].path;
      }

      if (req.files["product_gallary"]) {
        updateData.product_gallary = req.files["product_gallary"][0].path;
      }

      const product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updateData },
        { new: true }
      );
      if (!product) res.status(400).json({ mag: "Not Found" });
      else {
        res.status(200).json({
          msg: "Product updated successfully",
          updatedProduct: product,
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// Get products by trainer ID
router.get("/bytrainer", function (req, res, next) {
  Product.find({ trainer_id: req.user.id })
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
