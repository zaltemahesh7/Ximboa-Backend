const express = require("express");
const router = express.Router();
const {
  getUnseenNotifications,
} = require("../../../controllers/Notifications/notification.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.get("/unseen", jwtAuthMiddleware, getUnseenNotifications);

module.exports = router;
