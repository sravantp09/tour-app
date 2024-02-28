const express = require('express');
const router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  //checkBody,
} = require('../controllers/tourController.js');
const { protect, restrictTo } = require('../controllers/authController.js');
// const { createReview } = require('../controllers/reviewController.js');
const reviewRouter = require('../routes/reviewRoute.js');

// redirecting api call to review router
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  // get all tours information
  .get(getAllTours) // can access everyone
  // creating new tour
  .post(/*checkBody,*/ protect, restrictTo('admin', 'lead-guide'), createTour); // only admin and lead-guide can add new tours to the list

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
  .route('/tour-stats')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// POST tours/34ggedhf (ie, tourId)/reviews
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;
