require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const connectDB = require('./config/db');

console.log('🔧 Starting server...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('🗄️  MONGO_URI exists:', !!process.env.MONGO_URI);

(async () => {
  try {
    await connectDB();
    console.log('🛠️  Database connected, initializing Express app...');

    const app = express();

    console.log('⚙️  Setting up middleware...');

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

console.log('📁 Setting up static files...');
// Note: Static files should be served from a separate frontend host
// This backend is API-only when deployed
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '..')));
}

console.log('🛣️  Loading API routes...');
// ── API ROUTES ──
try {
  app.use('/api/auth',      require('./routes/auth'));
  console.log('✓ Auth routes loaded');
  app.use('/api/bikes',     require('./routes/bikes'));
  console.log('✓ Bikes routes loaded');
  app.use('/api/bookings',  require('./routes/bookings'));
  console.log('✓ Bookings routes loaded');
  app.use('/api/reviews',   require('./routes/reviews'));
  console.log('✓ Reviews routes loaded');
  app.use('/api/upload',    require('./routes/upload'));
  console.log('✓ Upload routes loaded');
  app.use('/api/payments',  require('./routes/payment'));
  console.log('✓ Payments routes loaded');
  app.use('/api/cleardata', require('./routes/clearData'));
  console.log('✓ ClearData routes loaded');
} catch (err) {
  console.error('❌ Error loading routes:', err);
  process.exit(1);
}

// Clean URL routes
app.get('/bikes',      (req, res) => res.sendFile(path.join(__dirname, '..', 'bikes.html')));
app.get('/admin',      (req, res) => res.sendFile(path.join(__dirname, '..', 'admin.html')));
app.get('/terms',      (req, res) => res.sendFile(path.join(__dirname, '..', 'terms.html')));
app.get('/mybookings', (req, res) => res.sendFile(path.join(__dirname, '..', 'mybookings.html')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Sri Ganesh Bike Rentals API' }));

// Fallback: serve 404 page for non-API routes only
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  const page404 = path.join(__dirname, '..', '404.html');
  res.sendFile(page404, err => {
    if (err) res.status(404).send('Page not found');
  });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server is listening on 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

  } catch (err) {
    console.error('❌ Fatal error during startup:', err);
    process.exit(1);
  }
})();
