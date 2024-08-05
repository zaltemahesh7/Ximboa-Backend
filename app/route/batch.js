const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Batch = require('../../model/batch');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Ensuring unique filenames
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});

// GET all batches
router.get("/", (req, res, next) => {
    Batch.find()
        .then((result) => {
            res.status(200).json({
                batches: result
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// POST a new batch with image upload
router.post("/", upload.single('batch_image'), (req, res, next) => {
    const batch = new Batch({
        _id: new mongoose.Types.ObjectId(),
        Batch_categories: req.body.Batch_categories,
        batch_name: req.body.batch_name,
        trainer_id: req.body.trainer_id,
        progress: req.body.progress,
        batch_image: req.file ? req.file.path : ''
    });

    batch.save()
        .then((result) => {
            console.log(result);
            res.status(200).json({
                newBatch: result
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// GET a batch by ID
router.get("/:id", (req, res, next) => {
    Batch.findById(req.params.id)
        .then(result => {
            if (!result) {
                return res.status(404).json({ error: 'Batch not found' });
            }
            res.status(200).json({
                batch: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// DELETE a batch by ID
router.delete("/:id", (req, res, next) => {
    Batch.deleteOne({ _id: req.params.id })
        .then(result => {
            res.status(200).json({
                msg: "Batch data successfully deleted",
                result: result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

// UPDATE a batch by ID with image upload
router.put("/:id", upload.single('batch_image'), (req, res, next) => {
    const updateOps = {
        Batch_categories: req.body.Batch_categories,
        batch_name: req.body.batch_name,
        trainer_id: req.body.trainer_id,
        progress: req.body.progress
    };
    if (req.file) {
        updateOps.batch_image = req.file.path;
    }

    Batch.findOneAndUpdate({ _id: req.params.id }, { $set: updateOps }, { new: true })
        .then(result => {
            res.status(200).json({
                msg:"updated data successfully",
                updatedBatch: result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

// GET batches by trainer ID
router.get("/BytrainerID/:trainerId", (req, res, next) => {
    Batch.find({ trainer_id: req.params.trainerId })
        .then(result => {
            res.status(200).json({
               ByTrainerIdBatches: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;
