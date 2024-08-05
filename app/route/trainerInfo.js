// var express = require('express');
// var router = express.Router();
// var mongoose = require('mongoose');
// var Trainer = require('../../model/trainerInformation');



// router.get("/", function (req, res, next) {
//     Trainer.find().then((result) => {
//         res.status(200).json({
//             trainerData: result
//         })
//     })
//     .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         })
//     })
// });

// router.post("/", function (req, res, next) {
//     var trainerInfo = new Trainer({
//         _id: new mongoose.Types.ObjectId,
//         trainer_id:req.body.trainer_id,
//         class_name: req.body.class_name,
//         trainer_name: req.body.trainer_name,
//         rating: req.body.rating,
//         rating_count: req.body.rating_count,
//         address: req.body.address,
//         mobile_number: req.body.mobile_number,
//         profil_share: req.body.profil_share
//     });

//     trainerInfo.save().then((result) => {
//         console.log(result);
//         res.status(200).json({
//             newTrainer: result
//         })
//     })
//     .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         })
//     })
// });

// router.get('/:id', function (req, res, next) {
//     console.log(req.params.id);
//     Trainer.findById(req.params.id).then((result) => {
//         console.log(result);
//         res.status(200).json({
//             newTrainer: result
//         })
//     })
//     .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         })
//     })
// });

// router.delete("/:id", function (req, res, next) {
//     Trainer.deleteOne({ _id: req.params.id }).then(result => {
//         res.status(200).json({
//             msg: "data successfully deleted",
//             result: result
//         })
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         })
//     })
// });

// router.put("/:id", function (req, res, next) {
//     Trainer.findOneAndUpdate({ _id: req.params.id }, {
//         $set: {
//             trainer_id:req.body.trainer_id,
//             class_name: req.body.class_name,
//             trainer_name: req.body.trainer_name,
//             rating: req.body.rating,
//             rating_count: req.body.rating_count,
//             address: req.body.address,
//             mobile_number: req.body.mobile_number,
//             profil_share: req.body.profil_share
//         }
//     })
//     .then(result => {
//         res.status(200).json({
//             msg: "data successfully updated",
//             result: result
//         })
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         })
//     })
// });

// // Get trainerInfo by trainer ID
// router.get("/BytrainerID/:trainerId", function (req, res, next) {
//     Trainer.find({ trainer_id: req.params.trainerId })
//       .then(result => {
//         res.status(200).json({
//         BytrainerId: result,
//         });
//       })
//       .catch(err => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//   });
// module.exports = router;



var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Trainer = require("../../model/trainerInformation");
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});

// Create a new trainer
router.post("/", upload.single('trainer_image'), function (req, res, next) {
    var trainerInfo = new Trainer({
        _id: new mongoose.Types.ObjectId(),
        trainer_id: req.body.trainer_id,
        trainer_name:req.body.trainer_name,
        trainer_whatsapp_no: req.body.trainer_whatsapp_no,
        date_of_birth: req.body.date_of_birth,
        rating: req.body.rating,
        rating_count: req.body.rating_count,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        country: req.body.country,
        state: req.body.state,
        pincode: req.body.pincode,
        trainer_image: req.file ? req.file.path : ''
    });

    trainerInfo.save().then((result) => {
        console.log(result);
        res.status(200).json({
            newTrainer: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// Get all trainers
router.get("/", (req, res, next) => {
    Trainer.find().then((result) => {
        res.status(200).json({
            allTrainers: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// Get a single trainer by ID
router.get("/:id", (req, res, next) => {
    Trainer.findById(req.params.id).then((result) => {
        if (!result) {
            return res.status(404).json({ error: 'Trainer not found' });
        }
        res.status(200).json({
            trainer: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// Update a trainer
router.put("/:id", upload.single('trainer_image'), (req, res, next) => {
    let updateData = {
        trainer_id: req.body.trainer_id,
        trainer_name:req.body.trainer_name,
        trainer_whatsapp_no: req.body.trainer_whatsapp_no,
        date_of_birth: req.body.date_of_birth,
        rating: req.body.rating,
        rating_count: req.body.rating_count,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        country: req.body.country,
        state: req.body.state,
        pincode: req.body.pincode
    };

    if (req.file) {
        updateData.trainer_image = req.file.path;
    }

    Trainer.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
    .then((result) => {
        res.status(200).json({
            msg: "Data updated successfully",
            updatedTrainer: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// Delete a trainer
router.delete("/:id", (req, res, next) => {
    Trainer.deleteOne({ _id: req.params.id }).then((result) => {
        res.status(200).json({
            msg: "Data deleted successfully",
            result: result
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;
