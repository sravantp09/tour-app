const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController.js');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController.js');

// middleware function
function log(req, res, next) {
  console.log('received new request');
  next();
}

// signup route
router.post('/signup', signUp);

// login route
router.post('/login', login);

// password forgot and reset
// received email id and ggenerate a random token and send to the user
router.post('/forgotPassword', forgotPassword);

// received random token generated above + new password
router.post('/resetPassword', resetPassword);

router
  .route('/')
  // get all users information
  .get(log, getAllUsers); // attaching multiple middleware functions

module.exports = router;
