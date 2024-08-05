var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// var SocialMedia = require('../../model/socialMedia');
var SocialMedia=require('../../model/socialMedia')

// Get all social media data
router.get("/", function(req, res, next) {
    SocialMedia.find().then((result) => {
        res.status(200).json({
            allSocialMedia: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    });
});

// Insert data into database
router.post("/", function(req, res, next) {
    var socialMedia = new SocialMedia({
        _id: new mongoose.Types.ObjectId(),
        Email_Id: req.body.Email_Id,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
        youtube: req.body.youtube,
        Linkdein: req.body.Linkdein,
        trainer_id: req.body.trainer_id // Save the trainer ID
    });

    socialMedia.save().then((result) => {
        res.status(200).json({
            newSocialMedia: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    });
});

// Single social media access
router.get("/:id", function(req, res, next) {
    SocialMedia.findById(req.params.id).then((result) => {
        res.status(200).json({
            SocialMedia: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    });
});

// Delete social media data
router.delete("/:id", function(req, res, next) {
    SocialMedia.deleteOne({ _id: req.params.id }).then((result) => {
        res.status(200).json({
            msg: "Data deleted successfully",
            result: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    });
});

// Update social media data
router.put("/:id", function(req, res, next) {
    SocialMedia.findOneAndUpdate({ _id: req.params.id }, {
        $set: {
            Email_Id: req.body.Email_Id,
            facebook: req.body.facebook,
            instagram: req.body.instagram,
            youtube: req.body.youtube,
            Linkdein: req.body.Linkdein,
            trainer_id: req.body.trainer_id // Update the trainer ID if needed
        }
    })
    .then((result) => {
        res.status(200).json({
            msg: "Data updated successfully",
            updatedSocialMedia: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    });
});

// Get social media data by trainer ID
router.get("/trainerID/:trainerId", function(req, res, next) {
    SocialMedia.find({ trainer_id: req.params.trainerId })
    .then((result) => {
        res.status(200).json({
            SocialMedia: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    });
});

module.exports = router;
