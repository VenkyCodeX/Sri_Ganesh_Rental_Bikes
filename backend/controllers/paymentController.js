const Razorpay = require('razorpay');
const crypto  = require('crypto');
const Booking = require('../models/Booking');

// Lazy init — only create instance when keys are present
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || amount < 100)
      return res.status(400).json({ message: 'Amount must be at least 100 paise' });

    const order = await getRazorpay().orders.create({
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });
    res.json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// POST /api/payments/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: 'Missing payment verification data' });

    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (razorpay_signature !== expectedSign)
      return res.status(400).json({ message: 'Payment verification failed' });

    if (bookingData) {
      const booking = await Booking.create({
        ...bookingData,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'paid',
      });
      return res.json({ success: true, booking });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = { createOrder, verifyPayment };
