// routes/videoRoutes.js

const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  streamVideo,
  getVideoMetadata,
} = require("../../controllers/videoController");
const { getGalleryByTrainerId } = require("../../controllers/galleryController");

// Route to handle video uploads
router.post("/upload", uploadVideo);
router.get("/stream/:id", streamVideo);
router.get("/metadata/:id", getVideoMetadata);
router.get('/pho/:trainer_id', getGalleryByTrainerId)

module.exports = router;
