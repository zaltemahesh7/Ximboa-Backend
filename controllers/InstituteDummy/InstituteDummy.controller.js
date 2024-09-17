const InstituteDummy = require("../../model/InstituteDummy/InstituteDummy.model");
const { ApiError } = require("../../utils/ApiError");

// Bulk insert controller for institutes
const bulkInsertInstitutes = async (req, res) => {
  try {
    const institutes = req.body.institutes;

    if (!institutes || institutes.length === 0) {
      return res.status(400).json({ message: "No institutes provided" });
    }

    const result = await InstituteDummy.insertMany(institutes);

    return res.status(201).json({
      message: "Institutes added successfully",
    });
  } catch (error) {
    console.error("Bulk insert error:", error);
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message | "An error occurred while inserting institutes",
          error
        )
      );
  }
};

const multer = require("multer");
const XLSX = require("xlsx");

// Configure multer for file uploads
const upload1 = multer({
  storage: multer.memoryStorage(), // Store file in memory to avoid file system usage
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Bulk insert controller for institutes from Excel
const bulkInsertInstitutesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No Excel file provided" });
    }

    // Parse the Excel file from buffer (memory)
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    // Assume the data is in the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const institutes = XLSX.utils.sheet_to_json(sheet);

    if (institutes.length === 0) {
      return res.status(400).json({ message: "No data found in Excel sheet" });
    }

    // Insert the data into MongoDB
    const result = await InstituteDummy.insertMany(institutes);

    return res.status(201).json({
      message: "Institutes added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Bulk insert from Excel error:", error);
    return res.status(500).json({
      message: "An error occurred while inserting institutes",
      error: error.message,
    });
  }
};

module.exports = {
  bulkInsertInstitutes,
  bulkInsertInstitutesFromExcel,
  upload1,
};
