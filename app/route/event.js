const express = require("express");
const router = express.Router();
const Event = require("../../model/event");
const upload = require("../../middleware/multerConfig");
const { jwtAuthMiddleware } = require("../../middleware/auth");
const registration = require("../../model/registration");
const NotificationModel = require("../../model/Notifications/Notification.model");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const InstituteModel = require("../../model/Institute/Institute.model");
const course = require("../../model/course");

// Create a new event
router.post(
  "/",
  jwtAuthMiddleware,
  upload.single("event_thumbnail"),
  async (req, res) => {
    try {
      const {
        event_name,
        event_type,
        event_info,
        event_description,
        event_category,
        event_date,
        event_start_time,
        event_end_time,
        event_location,
        event_languages,
        estimated_seats,
      } = req.body;

      const trainerid = req.user.id;

      // If file is uploaded, get file path from Multer
      const event_thumbnail = req.file ? req.file.path : "";
      console.log(event_thumbnail);

      const newEvent = new Event({
        event_name,
        event_date,
        event_type,
        event_info,
        event_description,
        event_category,
        event_thumbnail,
        event_start_time,
        event_end_time,
        event_location,
        event_languages,
        estimated_seats,
        trainerid,
      });

      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Error creating event", error });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by its ID and populate category_id with only category_name
    const eventWithFullImageUrls = await Event.findById(eventId)
      .populate("event_category", "category_name -_id")
      .lean();

    if (!eventWithFullImageUrls) {
      return res.status(404).json({ message: "Event not found" });
    }

    const courseCount = await course.countDocuments({
      trainer_id: eventWithFullImageUrls?.trainerid,
    });

    const institute = await InstituteModel.findOne({
      trainers: eventWithFullImageUrls?.trainerid?._id,
    }).select("institute_name social_Media");
    // Get base URL for image paths
    const baseUrl = req.protocol + "://" + req.get("host");

    const event = {
      _id: eventWithFullImageUrls?._id,
      event_thumbnail:
        `${baseUrl}/${eventWithFullImageUrls?.event_thumbnail?.replace(
          /\\/g,
          "/"
        )}` || "",
      event_info: eventWithFullImageUrls?.event_info || "",
      event_description: eventWithFullImageUrls?.event_description || "",
      event_date: eventWithFullImageUrls?.event_date || "",
      event_start_time: eventWithFullImageUrls?.event_start_time || "",
      event_end_time: eventWithFullImageUrls?.event_end_time || "",
      event_name: eventWithFullImageUrls?.event_name || "",
      event_category:
        eventWithFullImageUrls?.event_category.category_name || "",
      event_languages: eventWithFullImageUrls?.event_languages || "",
      estimated_seats: eventWithFullImageUrls?.estimated_seats || "",
      event_location: eventWithFullImageUrls?.event_location || "",
      event_type: eventWithFullImageUrls?.event_type || "",
      registered_users: eventWithFullImageUrls?.registered_users.length || "",
      trainer_image: eventWithFullImageUrls?.trainerid?.trainer_image
        ? `${baseUrl}/${eventWithFullImageUrls?.trainerid?.trainer_image?.replace(
            /\\/g,
            "/"
          )}`
        : "",
      trainer_id: eventWithFullImageUrls?.trainerid?._id,
      business_Name: eventWithFullImageUrls?.trainerid?.business_Name
        ? eventWithFullImageUrls?.trainerid?.business_Name
        : `${eventWithFullImageUrls?.trainerid?.f_Name || ""} ${
            eventWithFullImageUrls?.trainerid?.l_Name || ""
          }`.trim() || "",
      social_media: institute?.social_Media
        ? institute?.social_Media
        : eventWithFullImageUrls?.trainerid?.social_Media || "",
      trainier_rating: "Pending..###...",
      total_course: courseCount || "",
    };

    // Send back the event with the full thumbnail URL and direct category_name
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event", error });
  }
});

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

router.get("/trainer/bytrainer", async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const eventsData = await Event.find({ trainerid: req.user.id }).sort({
      createdAt: -1,
    });

    if (eventsData.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for this trainer" });
    }

    const events = eventsData.map((event) => ({
      _id: event?._id,
      event_name: event?.event_name || "",
      event_date: event?.event_date || "",
      event_category: event?.event_category?.category_name || "",
      event_type: event?.event_type || "",
      trainer_id: event?.trainerid?._id || "",
      registered_users: event?.registered_users.length || "",
      event_thumbnail: event?.event_thumbnail
        ? `${baseUrl}/${event?.event_thumbnail?.replace(/\\/g, "/")}`
        : "",
      estimated_seats: event.estimated_seats,
    }));

    res.status(200).json({
      events,
      event_thumbnail: `${baseUrl}/${events.event_thumbnail}`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error fetching events 71", error });
  }
});

// Update an event by ID
router.put("/:id", async (req, res) => {
  const eventId = req.params.id;
  const {
    event_name,
    event_type,
    event_info,
    event_description,
    event_category,
    event_thumbnail,
    event_date,
    event_start_time,
    event_end_time,
    event_location,
    event_languages,
    estimated_seats,
  } = req.body;
  const userId = req.user.id;

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json(new ApiError(404, "Event not found."));
    }

    // Check if the current user is the trainer who created the event
    // if (event.trainerid.toString() !== userId) {
    //   return res
    //     .status(403)
    //     .json(
    //       new ApiError(403, "You are not authorized to update this event.")
    //     );
    // }

    // Update event details
    event.event_name = event_name || event.event_name;
    event.event_type = event_type || event.event_type;
    event.event_info = event_info || event.event_info;
    event.event_description = event_description || event.event_description;
    event.event_category = event_category || event.event_category;
    event.event_thumbnail = event_thumbnail || event.event_thumbnail;
    event.event_date = event_date || event.event_date;
    event.event_start_time = event_start_time || event.event_start_time;
    event.event_end_time = event_end_time || event.event_end_time;
    event.event_location = event_location || event.event_location;
    event.event_languages = event_languages || event.event_languages;
    event.estimated_seats = estimated_seats || event.estimated_seats;

    const updatedEvent = await event.save();

    res
      .status(200)
      .json(new ApiResponse(200, "Event updated successfully", updatedEvent));
  } catch (error) {
    console.error("Event update error:", error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Error updating event", error));
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

// Route to register a user for an event
router.post("/registerevent", async (req, res) => {
  try {
    const evnet_id = req.body.event_id;
    const userId = req.user.id;

    const event = await Event.findById(evnet_id);
    if (!event) {
      console.log(event);
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await registration.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (event.registered_users.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already registered for this event" });
    }

    event.registered_users.push(userId);
    await event.save();

    const notification = new NotificationModel({
      recipient: userId,
      message: `You have successfully registered for the event: ${event.event_name}`,
      activityType: "EVENT_REGISTRATION",
      relatedId: event._id,
    });
    await notification.save();

    const notificationToTrainer = new NotificationModel({
      recipient: event.trainerid,
      message: `A ${user.f_Name} ${user.l_Name} has register for event: ${event.event_name}`,
      activityType: "EVENT_REGISTRATION",
      relatedId: userId,
    });
    await notificationToTrainer.save();

    res
      .status(200)
      .json({ message: "User registered for the event successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = router;
