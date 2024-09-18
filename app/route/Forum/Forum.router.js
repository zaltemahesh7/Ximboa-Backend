const express = require("express");
const router = express.Router();
const {
  addForum,
  getForumById,
} = require("../../../controllers/Forum/forum.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.post("/add", jwtAuthMiddleware, addForum);

router.get("/:id", getForumById);

module.exports = router;
