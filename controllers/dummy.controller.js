const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
require("dotenv").config();

// Use your existing DB connection
const conn = mongoose.connection;

const URL = `${process.env.DBURI}/${process.env.DB_NAME}`;

// Init GridFS Stream
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Storage engine
const storage = new GridFsStorage({
  url: URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Upload image to GridFS
const uploadImages = (req, res) => {
  upload.array("photos", 10)(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      files: req.files.map((file) => ({
        id: file.id,
        filename: file.filename,
      })),
    });
  });
};

// Retrieve image by filename from GridFS
const getImageById = (req, res) => {
  gfs.files.findOne(
    { _id: mongoose.Types.ObjectId(req.params.id) },
    (err, file) => {
      if (err || !file) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Check if the file is an image
      if (
        file.contentType === "image/jpeg" ||
        file.contentType === "image/png"
      ) {
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
      } else {
        res.status(400).json({ message: "File is not an image" });
      }
    }
  );
};

module.exports = {
  uploadImages,
  getImageById,
};
