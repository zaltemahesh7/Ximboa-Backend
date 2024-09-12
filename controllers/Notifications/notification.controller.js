const Notification = require("../../model/Notifications/Notification.model");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

const markNotificationAsSeen = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const userId = req.user.id; // Get logged-in user ID from token

    // Find the notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json(new ApiError(404, "Notification not found"));
    }

    // Update notification as seen
    notification.isSeen = true;
    notification.seenAt = new Date(); // Mark the current time
    await notification.save();

    res.status(200).json(new ApiResponse(200, "Notification marked as seen"));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

const getUnseenNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from token

    // Fetch unseen notifications
    const notifications = await Notification.find({
      recipient: userId,
      isSeen: false, // Fetch only unseen notifications
    })
      .sort({ createdAt: -1 }) // Sort by newest notifications first
      .limit(10);

    const notificationCount = notifications.length; // Count the number of notifications

    if (notificationCount === 0) {
      // Handle case where no notifications are found
      return res
        .status(200)
        .json(new ApiResponse(200, "No new notifications.", []));
    }

    // Return the notifications with the count
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `You have ${notificationCount} new notifications.`,
          notifications
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

module.exports = { markNotificationAsSeen, getUnseenNotifications };
