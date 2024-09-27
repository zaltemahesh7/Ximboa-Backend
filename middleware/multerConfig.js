const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/events"); // Folder where thumbnails will be stored
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
};

const upload = multer({ storage: storage });

// Initialize Multer
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
// });

module.exports = upload;
