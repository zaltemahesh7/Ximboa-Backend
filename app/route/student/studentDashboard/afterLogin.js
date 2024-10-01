const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category"); // Assuming you have a Category model
const Trainer = require("../../../../model/registration"); // Assuming you have a Category model

const Course = require("../../../../model/course");
const { jwtAuthMiddleware } = require("../../../../middleware/auth");
const {
  dashboard,
  getDashboardCountsForUser,
} = require("../../../../controllers/Dashboard/dashboard.controller");

// Get courses with specific fields, including trainer name populated
router.get("/dashboard", jwtAuthMiddleware, getDashboardCountsForUser);

module.exports = router;
