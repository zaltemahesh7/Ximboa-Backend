const express = require("express");
const router = express.Router();
const {
  createInstitute,
  updateInstitute,
  getAllInstitute,
} = require("../../../controllers/Institute/institute.controller");
const { upload } = require("../../../middleware/multer.middlewares");
const { jwtAuthMiddleware } = require("../../../middleware/auth");
const {
  bulkInsertInstitutes,
  bulkInsertInstitutesFromExcel,
  upload1,
  getInstitutes,
} = require("../../../controllers/InstituteDummy/InstituteDummy.controller");

router.get("/get-institutes", getAllInstitute);

router.post(
  "/create-institute",
  jwtAuthMiddleware,
  upload.array("institute_photos", 5),
  createInstitute
);

router.put(
  "/update-institute/:instituteId",
  jwtAuthMiddleware,
  updateInstitute
);

router.post(
  "/bulk-insert",
  upload.array("institute_photos", 10),
  bulkInsertInstitutes
);

// Route for bulk insert from Excel
router.post(
  "/bulk-insert/excel",
  upload1.single("file"),
  bulkInsertInstitutesFromExcel
);

// Route for bulk insert from Excel
router.get("/", getInstitutes);

module.exports = router;
