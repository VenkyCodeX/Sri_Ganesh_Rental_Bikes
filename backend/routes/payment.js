const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

// POST /api/payments/create-order
router.post('/create-order', createOrder);

// POST /api/payments/verify-payment
router.post('/verify-payment', verifyPayment);

module.exports = router;