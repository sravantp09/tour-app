const express = require('express');
const router = express.Router();

const {
  getOveriew,
  getTour,
  getLoginForm,
} = require('../controllers/viewsController.js');

router.get('/', getOveriew);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

// Adding redirection route for '/overview' to root router '/'
router.get('/overview', (req, res) => {
  return res.redirect('/');
});

router.get('/tour', (req, res) => {
  return res.redirect('/');
});

module.exports = router;
