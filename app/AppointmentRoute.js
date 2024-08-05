const express = require("express");
const router = express.Router();
const Appointment = require("../model/Appointment/Appointment");

// Create a new appointment
router.post("/", async (req, res) => {
    try {
        const { t_id, user_id, date, time } = req.body;
        const newAppointment = new Appointment({ t_id, user_id, date, time });
        await newAppointment.save();
        res.status(201).send(newAppointment);
    } catch (error) {
        res.status(400).send({ message: "Error creating appointment", error });
    }
});

// Get all appointments
router.get("/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("trainer_id")
            .populate("user_id");
        res.status(200).send(appointments);
    } catch (error) {
        res.status(500).send({ message: "Error fetching appointments", error });
    }
});

// Get appointments by trainer ID
router.get("/appointments/trainer/:trainer_id", async (req, res) => {
    try {
        const appointments = await Appointment.find({
            trainer_id: req.params.trainer_id,
        })
            .populate("trainer_id")
            .populate("user_id");
        res.status(200).send(appointments);
    } catch (error) {
        res
            .status(500)
            .send({ message: "Error fetching appointments by trainer ID", error });
    }
});

// Get appointments by user ID
router.get("/appointments/user/:user_id", async (req, res) => {
    try {
        const appointments = await Appointment.find({ user_id: req.params.user_id })
            .populate("trainer_id")
            .populate("user_id");
        res.status(200).send(appointments);
    } catch (error) {
        res
            .status(500)
            .send({ message: "Error fetching appointments by user ID", error });
    }
});

module.exports = router;