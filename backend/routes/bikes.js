const express = require('express');
const { getBikes, getBikeById, createBike, updateBike, deleteBike } = require('../controllers/bikeController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/',      getBikes);
router.get('/:id',   getBikeById);
router.post('/',     protect, adminOnly, createBike);
router.put('/:id',   protect, adminOnly, updateBike);
router.delete('/:id', protect, adminOnly, deleteBike);

module.exports = router;
