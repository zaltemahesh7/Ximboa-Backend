const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, +Date.now() + file.originalname);
  }
});

const filefilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: filefilter
});

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

router.post("/", upload.array('photos', 5), async (req, res) => {
  try {
    // Create a new Registration
    const { user_name, mobile_number, email_id, password, ...otherData } = req.body;
    const newRegistration = new Registration({
      _id: new mongoose.Types.ObjectId(),
      user_name,
      mobile_number,
      email_id,
      password
    });
    const registrationResult = await newRegistration.save();

    const trainer_id = registrationResult._id;

    // Create entries in other models using the same trainer_id
    const trainerInfo = new TrainerInfo({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      class_name: req.body.class_name,
      trainer_name: req.body.trainer_name,
      rating: req.body.rating,
      rating_count: req.body.rating_count,
      address: req.body.address,
      mobile_number: req.body.mobile_number,
      profil_share: req.body.profil_share
    });

    const testimonial = new Testimonial({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      Testimonial: req.body.Testimonial,
      Testimonial_Autor_Name: req.body.Testimonial_Autor_Name
    });

    const socialMedia = new SocialMedia({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      Email_Id: req.body.Email_Id,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      youtube: req.body.youtube,
      Linkdein: req.body.Linkdein,
    });

    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      Products_info: req.body.Products_info,
      Product_name: req.body.Product_name,
      Product_Prize: req.body.Product_Prize,
    });

    const gallery = new Gallery({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      photos: req.files.map(file => file.path)
    });

    const event = new Event({
      _id: new mongoose.Types.ObjectId(),
      trainer: trainer_id,
      event_name: req.body.event_name,
      event_type: req.body.event_type,
      event_categories: req.body.event_categories,
      event_start_time: req.body.event_start_time,
      event_End_time: req.body.event_End_time,
    });

    const education = new Education({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      school: req.body.school,
      college: req.body.college,
      degree: req.body.degree,
      other_details: req.body.other_details,
      achievements: req.body.achievements
    });

    const batch = new Batch({
      _id: new mongoose.Types.ObjectId(),
      trainer_id,
      batch_image: req.file ? req.file.path : '',
      Batch_categories: req.body.Batch_categories,
      batch_name: req.body.batch_name,
      progress: req.body.progress,
    });

    const about = new About({
      _id: new mongoose.Types.ObjectId(),
      trainer: trainer_id,
      about_us: req.body.about_us,
      our_services: req.body.our_services,
    });

    // Save all models
    await Promise.all([
      trainerInfo.save(),
      testimonial.save(),
      socialMedia.save(),
      product.save(),
      gallery.save(),
      event.save(),
      education.save(),
      batch.save(),
      about.save()
    ]);

    res.status(200).json({
      registration: registrationResult,
      trainerInfo,
      testimonial,
      socialMedia,
      product,
      gallery,
      event,
      education,
      batch,
      about
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
