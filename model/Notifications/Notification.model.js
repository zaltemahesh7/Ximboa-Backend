const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "Registration", // Reference to the user receiving the notification
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      "COURSE_ENROLLMENT",
      "COURSE_UPDATE",
      "EVENT",
      "ROLE_CHANGE",
      "EVENT_REGISTRATION",
      "EVENT_UPDATE",
      "OTHER",
      "COURSE_CREATE",
    ], // Example activities
    required: true,
  },
  relatedId: {
    type: Schema.Types.ObjectId, // Reference to the related entity (course, event, etc.)
    required: false,
  },
  isSeen: {
    type: Boolean,
    default: false, // All notifications are initially unseen
  },
  seenAt: {
    type: Date, // Timestamp for when the notification was viewed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
