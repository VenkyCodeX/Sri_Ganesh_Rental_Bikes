const express = require('express');
const { createBooking, getBookings, getStats, updateBookingStatus, getBookingsByPhone } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.post('/',                    createBooking);
router.get('/',                     protect, adminOnly, getBookings);
router.get('/stats',                protect, adminOnly, getStats);
router.get('/phone/:phone',         getBookingsByPhone);
router.patch('/:id/status',         protect, adminOnly, updateBookingStatus);

module.exports = router;
