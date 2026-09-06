require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const express = require('express');
const cors = require('cors');

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://venkycodex.github.io',
    'https://sriganeshbikerental.in',
    'https://www.sriganeshbikerental.in',
    'https://sriganeshrentalbikes-production.up.railway.app'
  ],
  credentials: true
}));

app.use(express.json());

// ── API ROUTES ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bikes', require('./routes/bikes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/cleardata', require('./routes/clearData'));

// ── API 404 ──
app.use('/api', (req, res) => {
  res.status(404).json({
    message: 'API route not found'
  });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error'
  });
});

module.exports = app;