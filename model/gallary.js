var mongoose = require('mongoose');

var gallerySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  photos: [String], // Array of strings to store file paths
  trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' } // Reference to Trainer
});

module.exports = mongoose.model('Gallery', gallerySchema);
