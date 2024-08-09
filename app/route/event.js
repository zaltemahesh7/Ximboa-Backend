const express = require("express");
const router = express.Router();
const Event = require("../../model/event");

// Create a new event
router.post("/", async (req, res) => {
  try {
    const {
      event_name,
      event_type,
      event_categories,
      event_start_time,
      event_end_time,
      trainerid,
    } = req.body;

    const newEvent = new Event({
      event_name,
      event_type,
      event_categories,
      event_start_time,
      event_end_time,
      trainerid,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: "Error creating event", error });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});

// Get a specific event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// Update an event by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          event_name: req.body.event_name,
          event_type: req.body.event_type,
          event_categories: req.body.event_categories,
          event_start_time: req.body.event_start_time,
          event_end_time: req.body.event_end_time,
          trainerid: req.body.trainerid,
        },
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
});

// Delete an event by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
});

module.exports = router;
