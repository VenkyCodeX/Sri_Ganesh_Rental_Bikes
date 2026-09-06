const connectDB = require('../backend/config/db');
const app = require('../backend/app');

let dbPromise;

module.exports = async (req, res) => {
  try {
    if (!dbPromise) {
      dbPromise = connectDB();
    }

    await dbPromise;

    return app(req, res);
  } catch (error) {
    console.error('Vercel API startup error:', error);

    return res.status(500).json({
      message: 'Database connection failed'
    });
  }
};