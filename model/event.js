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
    event_info: {
      type: String,
    },
    event_description: {
      type: String,
    },
    event_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    event_thumbnail: {
      type: String,
      // data: Buffer,
      // contentType: String,
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
    event_location: {
      type: String,
    },
    event_languages: [String],
    estimated_seats: Number,
    registered_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
    reviews: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Registration",
          required: true,
        },
        review: { type: String, required: true },
        star_count: { type: Number, require: true },
        addedAt: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
