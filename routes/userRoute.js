const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  getOneUser,
  getMe,
} = require('../controllers/userController.js');

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
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
router.patch('/resetPassword/:token', resetPassword);

// for updating user current password with new password
router.patch('/updateMyPassword', protect, updatePassword);

// updating currenntly logged in  user details
router.patch('/updateMe', protect, updateMe);

// delete currently logged in user
router.delete('/deleteMe', protect, deleteMe);

router
  .route('/')
  // get all users information
  .get(log, getAllUsers); // attaching multiple middleware functions

router.route('/me').get(protect, getMe, getOneUser);

router
  .route('/:id')
  .get(getOneUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
