const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  customer:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  bike:      { type: String, required: true },
  bikeId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Bike' },
  from:      { type: String, required: true },
  to:        { type: String, required: true },
  amount:    { type: Number, required: true },
  status:    { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'confirmed' },
  payMethod: { type: String, default: 'upi' },
  pickupTime: { type: String, default: '10:00' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  payment_status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
}, { timestamps: true });

BookingSchema.pre('save', function (next) {
  if (!this.bookingId) this.bookingId = 'SG' + Date.now();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
