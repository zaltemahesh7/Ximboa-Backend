const express = require("express");
const router = express.Router();
const {
  getUnseenNotifications,
  markNotificationAsSeen,
} = require("../../../controllers/Notifications/notification.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.get("/unseen", jwtAuthMiddleware, getUnseenNotifications);
router.post("/view/:notificationId", jwtAuthMiddleware, markNotificationAsSeen);

module.exports = router;
