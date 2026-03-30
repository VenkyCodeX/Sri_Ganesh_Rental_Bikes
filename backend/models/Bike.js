const mongoose = require('mongoose');

const BikeSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['cruiser', 'sport', 'scooter', 'adventure', 'commuter'] },
  price:    { type: Number, required: true, min: 1 },
  location: { type: String, required: true, trim: true },
  status:   { type: String, enum: ['available', 'rented', 'maintenance'], default: 'available' },
  img:      { type: String, default: 'assets/placeholder.svg' },
  badge:    { type: String, default: 'Available' },
  rating:   { type: Number, default: 4.5, min: 0, max: 5 },
  reviews:  { type: Number, default: 0 },
  engine:   { type: String, default: '' },
  desc:     { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Bike', BikeSchema);
