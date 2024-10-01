// routes/postRoutes.js
const express = require("express");
const postController = require("../../../controllers/Blogs/blogs.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

const router = express.Router();

router.get("/", postController.getAllPosts);
router.post("/", jwtAuthMiddleware, postController.createPost);
router.get("/:id", postController.getPostById);
router.put("/:id", jwtAuthMiddleware, postController.updatePost);
router.delete("/:id", jwtAuthMiddleware, postController.deletePost);
router.post("/:id/comments", jwtAuthMiddleware, postController.addComment);
router.post("/:id/like", jwtAuthMiddleware, postController.likePost);

module.exports = router;
