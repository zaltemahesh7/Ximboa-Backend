// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
} = require("../../controllers/Admin/adminController");


// Route to get all admins
router.get("/get_all_admin", getAllAdmins);

// Route to get an admin by ID
router.get("/:id", getAdminById);

module.exports = router;
