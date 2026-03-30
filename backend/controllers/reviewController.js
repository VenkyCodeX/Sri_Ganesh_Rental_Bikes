const Review = require('../models/Review');
const Bike   = require('../models/Bike');

// GET /api/reviews/:bikeId
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ bikeId: req.params.bikeId }).sort({ createdAt: -1 }).lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reviews/:bikeId
const createReview = async (req, res) => {
  try {
    const { name, rating, text } = req.body;
    if (!name || !rating || !text)
      return res.status(400).json({ message: 'All fields required' });

    const review = await Review.create({ bikeId: req.params.bikeId, name, rating, text });

    // Recalculate bike average rating
    const all = await Review.find({ bikeId: req.params.bikeId });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await Bike.findByIdAndUpdate(req.params.bikeId, { rating: +avg.toFixed(1), reviews: all.length });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReviews, createReview };
