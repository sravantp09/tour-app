const fs = require('fs');
const express = require('express');
const router = express.Router();

const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8'),
);

router
  .route('/')
  .get((req, res) => {
    if (!usersData || usersData.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'no data found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: {
        users: usersData,
      },
    });
  })
  .post((req, res) => {
    res.send('post');
  });

module.exports = router;
