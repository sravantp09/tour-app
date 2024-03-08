const express = require('express');
const router = express.Router();

const { getOveriew, getTour } = require('../controllers/viewsController.js');

router.get('/', getOveriew);
router.get('/tour', getTour);

module.exports = router;
