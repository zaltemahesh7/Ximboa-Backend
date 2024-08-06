const express = require("express");
const router = express.Router();
const Enquiry = require("../../model/Enquire");

// Create a new enquiry
router.post("/", async (req, res) => {
  try {
    const { t_id, description, u_id } = req.body;
    const newEnquiry = new Enquiry({ t_id, description, u_id });
    console.log(newEnquiry);
    
    await newEnquiry.save();
    res.status(201).send(newEnquiry);
  } catch (error) {
    res.status(400).send({ message: "Error creating enquiry", error });
  }
});

// Get all enquiries
router.get("/", async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate("t_id").populate("u_id");
    res.status(200).send(enquiries);
  } catch (error) {
    res.status(500).send({ message: "Error fetching enquiries", error });
  }
});

// Get enquiries by trainer ID
router.get("/bytrainer/:t_id", async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ t_id: req.params.t_id })
      .populate("t_id")
      .populate("u_id");
    res.status(200).send(enquiries);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching enquiries by trainer ID", error });
  }
});

// Get enquiries by user ID
router.get("/user/:u_id", async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ u_id: req.params.u_id })
      .populate("t_id")
      .populate("u_id");
    res.status(200).send(enquiries);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching enquiries by user ID", error });
  }
});

module.exports = router;