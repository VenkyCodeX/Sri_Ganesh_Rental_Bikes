const Booking = require('../models/Booking');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { customer, phone, bike, bikeId, from, to, amount, payMethod, pickupTime } = req.body;
    if (!customer || !phone || !bike || !from || !to || !amount)
      return res.status(400).json({ message: 'All booking fields are required' });

    const booking = await Booking.create({ customer, phone, bike, bikeId, from, to, amount, payMethod, pickupTime });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings  (admin)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/stats  (admin)
const getStats = async (req, res) => {
  try {
    const bookings  = await Booking.find().lean();
    const revenue   = bookings.reduce((s, b) => s + (b.amount || 0), 0);
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    res.json({ total: bookings.length, revenue, confirmed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/status  (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'pending', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/phone/:phone  (public)
const getBookingsByPhone = async (req, res) => {
  try {
    const bookings = await Booking.find({ phone: req.params.phone }).sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getBookings, getStats, updateBookingStatus, getBookingsByPhone };
