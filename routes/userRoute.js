const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  getOneUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
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

// This makes all the routes defined will be executed only after this protected executed
//router.use(protect);

// for updating user current password with new password
router.patch('/updateMyPassword', protect, updatePassword);

// updating currenntly logged in  user details
router.patch('/updateMe', protect, uploadUserPhoto, resizeUserPhoto, updateMe);

// delete currently logged in user
router.delete('/deleteMe', protect, deleteMe);

// all the routes below this will execute only if it passes through these middleware
router.use(protect, restrictTo('admin'));

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
