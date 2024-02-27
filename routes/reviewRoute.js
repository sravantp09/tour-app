const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController.js');
const { protect, restrictTo } = require('../controllers/authController.js');

router
  .route('/')
  .get(getAllReviews)
  // only logged in user can create review and the role must be user
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
