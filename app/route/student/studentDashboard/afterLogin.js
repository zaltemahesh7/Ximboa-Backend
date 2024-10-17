const express = require("express");
const router = express.Router();

const { jwtAuthMiddleware } = require("../../../../middleware/auth");
const {
  getDashboardCountsForUser,
} = require("../../../../controllers/Dashboard/dashboard.controller");

// Get courses with specific fields, including trainer name populated
router.get("/dashboard", jwtAuthMiddleware, getDashboardCountsForUser);

module.exports = router;
