const express = require("express");
const router = express.Router();
const {
  createInstitute,
} = require("../../../controllers/Institute/institute.controller");
const { upload } = require("../../../middleware/multer.middlewares"); // Multer setup for file uploads
const { jwtAuthMiddleware } = require("../../../middleware/auth");

// Route to create an institute with photo upload
router.post(
  "/create-institute",
  jwtAuthMiddleware,
  upload.array("institute_photos", 5), // Allow up to 5 images to be uploaded
  createInstitute
);

module.exports = router;
