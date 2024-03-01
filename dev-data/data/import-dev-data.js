require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel.js');
const User = require('../../models/userModel.js');
const Review = require('../../models/reviewModel.js');

const DB_CONNECTION = process.env.DB_CONNECTION;

mongoose
  .connect(DB_CONNECTION)
  .then((con) => {
    console.log('Database Connected...');
    deleteAllData();
  })
  .catch((err) => {
    console.log(err.message);
  });

// array of tours
const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),
);

const userData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8'),
);

const reviewData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

async function uploadData() {
  try {
    await Tour.create(tourData);
    await User.create(userData, { validateBeforeSave: false });
    await Review.create(reviewData);
    console.log('Data uploaded...');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
}

async function deleteAllData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Deleted all tour data');
    // uploading new data after deletion
    uploadData();
  } catch (err) {
    console.log(err.message);
  }
}
