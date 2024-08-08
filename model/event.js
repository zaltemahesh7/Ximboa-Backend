const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    event_name: { type: String, required: true },
    event_type: { type: String, required: true },
    event_categories: { type: [String], required: true },
    event_start_time: { type: Date, required: true },
    event_end_time: { type: Date, required: true },
    trainerid: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
