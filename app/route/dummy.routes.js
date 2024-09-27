const express = require("express");
const router = express.Router();
const {
  uploadImages,
  getImageById,
} = require("../../controllers/dummy.controller");

// Route to upload images
router.post("/upload", uploadImages);

// Route to retrieve image by ID
router.get("/image/:id", getImageById);

module.exports = router;
