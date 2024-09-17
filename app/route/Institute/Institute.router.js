const express = require("express");
const router = express.Router();
const {
  createInstitute,
} = require("../../../controllers/Institute/institute.controller");
const { upload } = require("../../../middleware/multer.middlewares");
const { jwtAuthMiddleware } = require("../../../middleware/auth");
const {
  bulkInsertInstitutes,
} = require("../../../controllers/InstituteDummy/InstituteDummy.controller");

// Route to create an institute with photo upload
router.post(
  "/create-institute",
  jwtAuthMiddleware,
  upload.array("institute_photos", 5),
  createInstitute
);

router.post(
  "/bulk-insert",
  upload.array("institute_photos", 10),
  bulkInsertInstitutes
);

module.exports = router;
