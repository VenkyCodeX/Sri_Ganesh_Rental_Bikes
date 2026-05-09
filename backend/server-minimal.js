require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 5000;

console.log('🔧 Minimal server starting...');
console.log('📍 PORT:', PORT);

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Minimal server running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sri Ganesh Bike Rentals API' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
});
