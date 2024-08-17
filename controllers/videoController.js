// controllers/videoController.js

const Video = require("../model/video");

// Multer setup for file uploads
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/videos/"); // Path to store videos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit (adjust as necessary)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("video");

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /mp4|mov|wmv|avi/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Videos Only!");
  }
}

// Controller to handle video upload
const uploadVideo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);

      return res.status(400).json({ message: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    try {
      const { title, description } = req.body;

      // Save video data in database
      const newVideo = new Video({
        title,
        description,
        videoPath: req.file.path,
      });

      await newVideo.save();

      res
        .status(201)
        .json({ message: "Video uploaded successfully", video: newVideo });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error uploading video", error });
    }
  });
};

// Get video metadata by ID
const getVideoMetadata = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Get base URL for the video path
    const baseUrl = req.protocol + "://" + req.get("host");

    // Construct full video URL
    const videoUrl = `${baseUrl}/${video.videoPath.replace(/\\/g, "/")}`;

    // Return video metadata with the full URL
    res.status(200).json({
      ...video._doc,
      videoPath: videoUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching video metadata", error });
  }
};

// Stream video by ID
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const videoPath = path.resolve(video.videoPath);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res
          .status(416)
          .send(
            "Requested range not satisfiable\n" + start + " >= " + fileSize
          );
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error streaming video", error });
  }
};

module.exports = {
  uploadVideo,
  streamVideo,
  getVideoMetadata,
};
