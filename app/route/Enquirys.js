const express = require("express");
const router = express.Router();
const Enquiry = require("../../model/Enquire");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const NotificationModel = require("../../model/Notifications/Notification.model");

// Create a new enquiry
router.post("/", async (req, res) => {
  try {
    const { description, trainerid } = req.body;
    const userid = req.user.id;
    const newEnquiry = new Enquiry({ trainerid, description, userid });
    console.log(newEnquiry);

    await newEnquiry.save();

    const notification = new NotificationModel({
      recipient: trainerid,
      message: `New inquiry received from ${req.user.id}".`,
      activityType: "NEW_ENQUIRY",
      relatedId: newEnquiry._id,
    });
    await notification.save();

    res.status(201).send(newEnquiry);
  } catch (error) {
    res.status(400).send({ message: "Error creating enquiry", error });
  }
});

// Get all enquiries
router.get("/", async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    res.status(200).send(enquiries);
  } catch (error) {
    res.status(500).send({ message: "Error fetching enquiries", error });
  }
});

// Get enquiries by trainer ID
router.get("/bytrainer", async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ trainerid: req.user.id });
    res.status(200).send(enquiries);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching enquiries by trainer ID", error });
  }
});

// Get enquiries by user ID
router.get("/user/:userid", async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ userid: req.params.userid })
      .populate("trainerid")
      .populate("userid");
    res.status(200).send(enquiries);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching enquiries by user ID", error });
  }
});

// Find and delete the enquiry by its ID
router.delete("/:enquiryId", async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const deletedEnquiry = await Enquiry.findByIdAndDelete(enquiryId);
    console.log(deletedEnquiry);

    // Check if the enquiry exists
    if (!deletedEnquiry) {
      return res.status(404).json(new ApiError(404, "Enquiry not found"));
    }

    res.status(200).json(new ApiResponse(200, "Enquiry deleted successfully"));
  } catch (error) {
    console.log(error);

    res.status(500).json(new ApiError(500, "Error deleting enquiry", error));
  }
});

module.exports = router;
