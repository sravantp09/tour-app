const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController.js');
const { signUp, login } = require('../controllers/authController.js');

// middleware function
function log(req, res, next) {
  console.log('received new request');
  next();
}

// signup route
router.post('/signup', signUp);

// login route
router.post('/login', login);

router
  .route('/')
  // get all users information
  .get(log, getAllUsers); // attaching multiple middleware functions

module.exports = router;
