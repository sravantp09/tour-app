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
  //checkBody,
} = require('../controllers/tourController.js');

router
  .route('/')
  // get all tours information
  .get(getAllTours)
  // creating new tour
  .post(/*checkBody,*/ createTour);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
