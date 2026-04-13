require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://venkycodex.github.io',
    'https://sriganeshbikerental.in',
    'https://www.sriganeshbikerental.in'
  ],
  credentials: true
}));
app.use(express.json());

// Serve frontend static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bikes',    require('./routes/bikes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/upload',   require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Sri Ganesh Bike Rentals API' }));

// Fallback: serve 404 page for non-API routes only
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '..', '404.html'));
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
