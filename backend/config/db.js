const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    console.log('🔌 Attempting MongoDB connection...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log('✅ Database connection successful, continuing startup...');
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.error('Full error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
