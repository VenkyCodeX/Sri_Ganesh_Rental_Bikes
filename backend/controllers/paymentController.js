const { Cashfree } = require('cashfree-pg');
const Booking = require('../models/Booking');

Cashfree.XClientId     = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment  = process.env.CASHFREE_ENV === 'production'
  ? Cashfree.Environment.PRODUCTION
  : Cashfree.Environment.SANDBOX;

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { amount, customer, phone, bikeId, bike, from, to, pickupTime } = req.body;
    if (!amount || !customer || !phone)
      return res.status(400).json({ message: 'amount, customer and phone are required' });

    const orderId = 'SG' + Date.now();

    const orderData = {
      order_id:       orderId,
      order_amount:   amount,
      order_currency: 'INR',
      customer_details: {
        customer_id:    phone,
        customer_name:  customer,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'https://sriganeshbikerental.in'}/bikes.html?order_id={order_id}&order_token={order_token}`,
      },
      order_note: `Bike rental: ${bike} from ${from} to ${to}`,
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', orderData);
    const order    = response.data;

    res.json({
      order_id:      order.order_id,
      payment_session_id: order.payment_session_id,
      amount:        order.order_amount,
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

    const response = await Cashfree.PGFetchOrder('2023-08-01', order_id);
    const order    = response.data;

    if (order.order_status !== 'PAID')
      return res.status(400).json({ message: 'Payment not completed', status: order.order_status });

    // Save booking
    const booking = await Booking.create({
      ...bookingData,
      bookingId:  order_id,
      payMethod:  'cashfree',
      status:     'confirmed',
    });

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Cashfree verify error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = { createOrder, verifyPayment };
