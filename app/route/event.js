const express = require("express");
const router = express.Router();
const Event = require("../../model/event");
const upload = require("../../middleware/multerConfig");
const { jwtAuthMiddleware } = require("../../middleware/auth");

// Create a new event
router.post(
  "/",
  jwtAuthMiddleware,
  upload.single("event_thumbnail"),
  async (req, res) => {
    try {
      const {
        event_name,
        event_category,
        event_type,
        event_start_time,
        event_end_time,
      } = req.body;

      const trainerid = req.user.id;

      // If file is uploaded, get file path from Multer
      const event_thumbnail = req.file ? req.file.path : null;

      const newEvent = new Event({
        event_name,
        event_type,
        event_category,
        event_thumbnail,
        event_start_time,
        event_end_time,
        trainerid,
      });

      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      res.status(400).json({ message: "Error creating event", error });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by its ID and populate category_id with only category_name
    const eventWithFullThumbnailUrl = await Event.findById(eventId)
      .populate("event_category", "category_name -_id")
      .lean();

    if (!eventWithFullThumbnailUrl) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    const event = {
      ...eventWithFullThumbnailUrl,
      event_categories: eventWithFullThumbnailUrl.event_category.category_name, // Directly include category_name
      event_thumbnail: eventWithFullThumbnailUrl.event_thumbnail
        ? `${baseUrl}/${eventWithFullThumbnailUrl.event_thumbnail.replace(/\\/g, "/")}`
        : "",
    };

    // Send back the event with the full thumbnail URL and direct category_name
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// router.get("/:id", async (req, res) => {
//   try {
//     const eventWithFullImageUrls = await Event.findById(req.params.id)
//     .populate("event_category", "category_name")
//     .select("-trainerid")

//     const event = {
//       ...eventWithFullImageUrls._doc,
//       event_thumbnail: `http://${req.headers.host}/${eventWithFullImageUrls.event_thumbnail}`,
//     };
//     if (!event) {
//       return res.status(404).json(new ApiError(404, "Event not found"));
//     }
//     res.status(200).json(event);
//   } catch (error) {
//     // console.log(error);
//     res.status(500).json({ message: "Error fetching event", error });
//   }
// });

router.get("/events", async (req, res) => {
  try {
    // Get the event type from query params
    const { event_type } = req.query;

    // Validate the event type
    if (!event_type) {
      return res.status(400).json({ message: "Event type is required" });
    }

    // Filter events by the specified type
    const events = await Event.find({ event_type });

    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    // Add base URL to the event_thumbnail path
    const eventsWithFullThumbnailUrl = events.map((event) => {
      return {
        ...event._doc,
        event_thumbnail: event.event_thumbnail
          ? `${baseUrl}/${event.event_thumbnail.replace(/\\/g, "/")}`
          : "",
      };
    });

    res.status(200).json(eventsWithFullThumbnailUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events", error });
  }
});

// trainer/:trainerid

router.get("/bytrainer", async (req, res) => {
  try {
    const events = await Event.find({ trainerid: req.user.id });
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for this trainer" });
    }
    res.status(200).json(events);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error fetching events 71", error });
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
          trainerid: req.user.id,
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
