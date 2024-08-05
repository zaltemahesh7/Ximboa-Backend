const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Batch_categories: String,
    batch_name: String,
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
    progress: String,
    batch_image: String
});

module.exports = mongoose.model('Batch', batchSchema);


