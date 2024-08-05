var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    event_name: String,
    event_type: String,
    event_categories: String,
    event_start_time: String,
    event_End_time: String,
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' } // Add this line
});

module.exports = mongoose.model('Event', eventSchema);
