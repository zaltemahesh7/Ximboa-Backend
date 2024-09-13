const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    event_name: {
      type: String,
      required: true,
    },
    event_type: {
      type: String,
      required: true,
    },
    event_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    event_thumbnail: {
      type: String,
    },
    trainerid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    event_date: {
      type: Date,
      required: true,
    },
    event_start_time: {
      type: String,
      required: true,
    },
    event_end_time: {
      type: String,
      required: true,
    },
    registered_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
