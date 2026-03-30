const Bike = require('../models/Bike');

// GET /api/bikes
const getBikes = async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let query = {};

    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let bikes = Bike.find(query);

    if (sort === 'price-asc')  bikes = bikes.sort({ price:  1 });
    if (sort === 'price-desc') bikes = bikes.sort({ price: -1 });
    if (sort === 'rating')     bikes = bikes.sort({ rating: -1 });

    res.json(await bikes.lean());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bikes  (admin)
const createBike = async (req, res) => {
  try {
    const bike = await Bike.create(req.body);
    res.status(201).json(bike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/bikes/:id  (admin)
const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json(bike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/bikes/:id  (admin)
const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json({ message: 'Bike deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bikes/:id
const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id).lean();
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBikes, getBikeById, createBike, updateBike, deleteBike };
