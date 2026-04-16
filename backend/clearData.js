require('dotenv').config();
const mongoose = require('mongoose');
const Booking  = require('./models/Booking');
const Review   = require('./models/Review');

async function clearData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const b = await Booking.deleteMany({});
  console.log(`Deleted ${b.deletedCount} bookings`);

  const r = await Review.deleteMany({});
  console.log(`Deleted ${r.deletedCount} reviews`);

  await mongoose.disconnect();
  console.log('Done. All booking & review data cleared.');
}

clearData().catch(err => { console.error(err); process.exit(1); });
