const mongoose = require('mongoose');

const BikeSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  category:         { type: String, required: true, enum: ['cruiser', 'sport', 'scooter', 'adventure', 'commuter'] },
  price:            { type: Number, required: true, min: 1 },
  location:         { type: String, required: true, trim: true },
  status:           { type: String, enum: ['available', 'rented', 'maintenance'], default: 'available' },
  img:              { type: String, default: 'assets/placeholder.svg' },
  badge:            { type: String, default: 'Available' },
  rating:           { type: Number, default: 4.5, min: 0, max: 5 },
  reviews:          { type: Number, default: 0 },
  engine:           { type: String, default: '' },
  desc:             { type: String, default: '' },
  // New fields
  bikeNumber:       { type: String, default: '' },
  transmission:     { type: String, enum: ['Manual', 'Automatic'], default: 'Manual' },
  fuelType:         { type: String, enum: ['Petrol', 'Electric', 'CNG'], default: 'Petrol' },
  seats:            { type: Number, default: 2 },
  fuelIncluded:     { type: String, enum: ['Fuel Included', 'Fuel Excluded'], default: 'Fuel Excluded' },
  kmLimit:          { type: Number, default: 0 },
  extraChargePerKm: { type: Number, default: 0 },
  deposit:          { type: Number, default: 0 },
  manufacturedYear: { type: String, default: '' },
  payAtPickup:      { type: String, enum: ['Yes', 'No'], default: 'Yes' },
  availableAt:      { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Bike', BikeSchema);
