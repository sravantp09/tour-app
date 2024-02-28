const express = require('express');
const router = express.Router({ mergeParams: true }); // merging url params
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
} = require('../controllers/reviewController.js');
const { protect, restrictTo } = require('../controllers/authController.js');

router.use(protect); // all routes below can only accessible to user who are logged in

router
  .route('/')
  .get(getAllReviews)
  // only logged in user can create review and the role must be user
  .post(restrictTo('user', 'admin'), createReview);

// delete and update review using id
router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
