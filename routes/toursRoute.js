const express = require('express');
const router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  //checkBody,
} = require('../controllers/tourController.js');

router
  .route('/')
  // get all tours information
  .get(getAllTours)
  // creating new tour
  .post(/*checkBody,*/ createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
