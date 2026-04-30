const cashfree = require('cashfree-pg');
const Booking  = require('../models/Booking');

const isProd = process.env.CASHFREE_ENV === 'production';

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { amount, customer, phone, bike, from, to, pickupTime } = req.body;
    if (!amount || !customer || !phone)
      return res.status(400).json({ message: 'amount, customer and phone are required' });

    const orderId = 'SG' + Date.now();

    const response = await cashfree.PGCreateOrder({
      'x-client-id':     process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      'x-api-version':   '2023-08-01',
    }, {
      order_id:       orderId,
      order_amount:   amount,
      order_currency: 'INR',
      customer_details: {
        customer_id:    phone,
        customer_name:  customer,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'https://sriganeshbikerental.in'}/bikes.html?order_id=${orderId}`,
      },
      order_note: `Bike rental: ${bike} from ${from} to ${to}`,
    });

    res.json({
      order_id:           response.data.order_id,
      payment_session_id: response.data.payment_session_id,
      amount:             response.data.order_amount,
    });
  } catch (err) {
    console.error('Cashfree order error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// POST /api/payments/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { order_id, bookingData } = req.body;
    if (!order_id)
      return res.status(400).json({ message: 'order_id is required' });

    const response = await cashfree.PGFetchOrder({
      'x-client-id':     process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      'x-api-version':   '2023-08-01',
    }, order_id);

    const order = response.data;
    if (order.order_status !== 'PAID')
      return res.status(400).json({ message: 'Payment not completed', status: order.order_status });

    const booking = await Booking.create({
      ...bookingData,
      bookingId: order_id,
      payMethod: 'cashfree',
      status:    'confirmed',
    });

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Cashfree verify error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = { createOrder, verifyPayment };
