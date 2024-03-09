const express = require('express');
const router = express.Router();

const { getOveriew, getTour } = require('../controllers/viewsController.js');

router.get('/', getOveriew);
router.get('/tour', getTour);

// Adding redirection route for '/overview' to root router '/'
router.get('/overview', (req, res) => {
  return res.redirect('/');
});

module.exports = router;
