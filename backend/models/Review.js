const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  name:   { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text:   { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
