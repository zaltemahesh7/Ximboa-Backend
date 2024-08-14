const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category"); // Assuming you have a Category model
const Trainer = require("../../../../model/registration"); // Assuming you have a Category model

const Course = require("../../../../model/course");

// Get courses with specific fields, including trainer name populated
router.get("/", async (req, res) => {
    
});

module.exports = router;
