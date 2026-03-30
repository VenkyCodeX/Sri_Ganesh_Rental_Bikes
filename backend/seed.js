require('dotenv').config();
const mongoose = require('mongoose');
const Bike     = require('./models/Bike');
const connectDB = require('./config/db');

const SEED_BIKES = [
  { name: 'Royal Enfield Classic 350', category: 'cruiser',   price: 699, location: 'Balkampet', status: 'available', img: 'assets/Royal-Enfield.webp',  rating: 4.8, reviews: 124, badge: 'Popular',   engine: '349cc', desc: 'Iconic cruiser with timeless style and powerful engine.' },
  { name: 'Honda Activa 6G',           category: 'scooter',   price: 299, location: 'Balkampet', status: 'available', img: 'assets/Activa.webp',          rating: 4.5, reviews: 210, badge: 'Popular',   engine: '109cc', desc: 'India\'s best-selling scooter. Smooth, reliable, fuel-efficient.' },
  { name: 'Honda Activa (Classic)',    category: 'scooter',   price: 279, location: 'Balkampet', status: 'available', img: 'assets/Honda-Activa.webp',    rating: 4.4, reviews: 134, badge: 'Available',  engine: '109cc', desc: 'Classic Activa variant, perfect for city commutes.' },
  { name: 'Honda Activa (Sport)',      category: 'scooter',   price: 289, location: 'Balkampet', status: 'available', img: 'assets/Honda-Activa2.webp',   rating: 4.3, reviews: 98,  badge: 'Available',  engine: '109cc', desc: 'Sporty Activa with enhanced looks and performance.' },
  { name: 'Honda Shine',               category: 'commuter',  price: 349, location: 'Balkampet', status: 'available', img: 'assets/Honda-Shine.webp',     rating: 4.6, reviews: 89,  badge: 'Hot',        engine: '124cc', desc: 'Reliable commuter bike with excellent mileage.' },
  { name: 'Bajaj Avenger 220',         category: 'cruiser',   price: 599, location: 'Balkampet', status: 'available', img: 'assets/Avengers.webp',        rating: 4.5, reviews: 76,  badge: 'Available',  engine: '220cc', desc: 'Laid-back cruiser built for long highway rides.' },
  { name: 'Activa Scooter',            category: 'scooter',   price: 259, location: 'Balkampet', status: 'available', img: 'assets/activa-scooter.webp',  rating: 4.2, reviews: 61,  badge: 'Available',  engine: '109cc', desc: 'Budget-friendly scooter for daily city use.' },
  { name: 'Honda Activa Premium',      category: 'scooter',   price: 319, location: 'Balkampet', status: 'available', img: 'assets/Activa1.webp',         rating: 4.4, reviews: 53,  badge: 'New',        engine: '109cc', desc: 'Premium Activa with extra features and comfort.' },
];

const seed = async () => {
  await connectDB();
  await Bike.deleteMany({});
  await Bike.insertMany(SEED_BIKES);
  console.log(`✅ Seeded ${SEED_BIKES.length} bikes`);
  process.exit(0);
};

seed();
