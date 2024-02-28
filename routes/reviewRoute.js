const express = require('express');
const router = express.Router({ mergeParams: true }); // merging url params
const {
  getAllReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController.js');
const { protect, restrictTo } = require('../controllers/authController.js');

router
  .route('/')
  .get(getAllReviews)
  // only logged in user can create review and the role must be user
  .post(protect, restrictTo('user'), createReview);

// delete review using id
router.route('/:id').delete(protect, deleteReview);

module.exports = router;
