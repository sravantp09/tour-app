const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController.js');

router
  .route('/')
  // get all users information
  .get(getAllUsers);

module.exports = router;
