const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Booking  = require('../models/Booking');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || amount < 100)
      return res.status(400).json({ message: 'Amount must be at least 100 paise' });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: 'SG' + Date.now(),
    });

    res.json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// POST /api/payments/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: 'Missing payment fields' });

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: 'Invalid payment signature' });

    const booking = await Booking.create({
      ...bookingData,
      bookingId: 'SG' + Date.now(),
      payMethod: 'online',
      status:    'confirmed',
    });

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = { createOrder, verifyPayment };
