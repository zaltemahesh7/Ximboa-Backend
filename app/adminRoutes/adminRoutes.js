// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
} = require("../../controllers/Admin/adminController");

// Route to create a new admin
router.post("/", createAdmin);

// Route to get all admins
router.get("/", getAllAdmins);

// Route to get an admin by ID
router.get("/:id", getAdminById);

module.exports = router;
