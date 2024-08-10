const express = require("express");
const router = express.Router();
const Appointment = require("../model/Appointment/Appointment");

// Create a new appointment
router.post("/", async (req, res) => {
    try {
        const { t_id, user_id, date, time } = req.body;
        const newAppointment = new Appointment({ t_id, user_id, date, time });
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(400).json({ message: "Error creating appointment", error });
    }
});

// Get all appointments
router.get("/", async (req, res) => {
    try {
        const appointments = await Appointment.find()
            // .populate("t_id", "name email") // Populate trainer details
            // .populate("user_id", "name email"); // Populate user details
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments", error });
    }
});

// Get appointments by trainer ID
router.get("/trainer/:trainer_id", async (req, res) => {
    try {
        const appointments = await Appointment.find({ t_id: req.params.trainer_id })
            // .populate("t_id", "name email")
            // .populate("user_id", "name email");
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments by trainer ID", error });
    }
});

// Get appointments by user ID
router.get("/user/:user_id", async (req, res) => {
    try {
        const appointments = await Appointment.find({ user_id: req.params.user_id })
            .populate("t_id", "name email")
            .populate("user_id", "name email");
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments by user ID", error });
    }
});

// Update an appointment
router.put("/:appointment_id", async (req, res) => {
    try {
        const { t_id, user_id, date, time } = req.body;
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.appointment_id,
            { t_id, user_id, date, time },
            { new: true }
        );
        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(400).json({ message: "Error updating appointment", error });
    }
});

// Delete an appointment
router.delete("/:appointment_id", async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.appointment_id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting appointment", error });
    }
});

module.exports = router;
