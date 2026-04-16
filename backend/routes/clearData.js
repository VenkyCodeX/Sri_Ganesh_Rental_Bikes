const express  = require('express');
const router   = express.Router();
const Booking  = require('../models/Booking');
const Review   = require('../models/Review');
const { adminOnly } = require('../middleware/auth');

// DELETE all bookings + reviews (admin only)
router.delete('/all', adminOnly, async (req, res) => {
  try {
    const b = await Booking.deleteMany({});
    const r = await Review.deleteMany({});
    res.json({ message: 'All data cleared', bookings: b.deletedCount, reviews: r.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
