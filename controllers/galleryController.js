// controllers/galleryController.js

const Gallery = require("../model/gallary");

const getGalleryByTrainerId = async (req, res) => {
  try {
    const trainerId = req.params.trainer_id;

    // Find gallery by trainer ID
    const gallery = await Gallery.findOne({ trainer_id: trainerId }).populate(
      "trainer_id"
    );
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    // Get base URL for the image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    // Map photos to include full URLs
    const photosWithFullUrl = gallery.photos.map((photo) => {
      return `${baseUrl}/${photo.replace(/\\/g, "/")}`;
    });

    // Return gallery data with full URLs
    res.status(200).json({
      ...gallery._doc,
      photos: photosWithFullUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching gallery data", error });
  }
};

module.exports = {
  getGalleryByTrainerId,
};
