const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController.js');

// middleware function
function log(req, res, next) {
  console.log('received new request');
  next();
}

router
  .route('/')
  // get all users information
  .get(log, getAllUsers); // attaching multiple middleware functions

module.exports = router;
