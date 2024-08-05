const express = require('express');
const router = express.Router();

const Registration = require('../../model/registration');
const TrainerInfo = require('../../model/trainerInformation');
const Testimonial = require('../../model/testemonial');
const SocialMedia = require('../../model/socialMedia');
const Product = require('../../model/product');
const Gallery = require('../../model/gallary');
const Event = require('../../model/event');
const Education = require('../../model/education');
const Batch = require('../../model/batch');
const About = require('../../model/about');

router.get("/:trainerId", async (req, res) => {
    const trainerId = req.params.trainerId;

    try {
        const results = await Promise.all([
            About.find({ trainer: trainerId }),
            Batch.find({ trainer_id: trainerId }),
            Education.find({ trainer_id: trainerId }),
            Event.find({ trainer: trainerId }),
            Gallery.find({ trainer_id: trainerId }),
            Product.find({ trainer_id: trainerId }),
            SocialMedia.find({ trainer_id: trainerId }),
            Testimonial.find({ trainer_id: trainerId }),
            TrainerInfo.find({ trainer_id: trainerId })
        ]);

        res.status(200).json({
            byTrainerAboutData: results[0],
            ByTrainerIdBatches: results[1],
            ByTrainerIDeducation: results[2],
            ByTrainerIDevents: results[3],
            ByTrainerIDgalleryData: results[4],
            ByTrainerIDProducts: results[5],
            SocialMedia: results[6],
            ByTrainerIDtestimonials: results[7],
            BytrainerId: results[8]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;
