const express = require("express");
const router = express.Router();
const {
  addForum,
  getForumById,
  addReplyToPost,
} = require("../../../controllers/Forum/forum.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.post("/add", jwtAuthMiddleware, addForum);

router.get("/:id", getForumById);
router.post("/reply", jwtAuthMiddleware, addReplyToPost);

module.exports = router;
