const express = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');
const router = express.Router();

router.get('/:bikeId',  getReviews);
router.post('/:bikeId', createReview);

module.exports = router;
