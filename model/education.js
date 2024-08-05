var mongoose = require('mongoose');

var educationSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    school: String,
    college: String,
    degree: String,
    other_details: String,
    achievements: String,
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' } // Reference to Trainer model
});

module.exports = mongoose.model('Education', educationSchema);
