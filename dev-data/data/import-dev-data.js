require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel.js');

const DB_CONNECTION = process.env.DB_CONNECTION;

mongoose
  .connect(DB_CONNECTION)
  .then((con) => {
    console.log('Database Connected...');
    deleteAllTourData();
  })
  .catch((err) => {
    console.log(err.message);
  });

// array of tours
const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),
);

async function uploadTourData() {
  try {
    await Tour.create(tourData);
    console.log('Data uploaded...');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
}

async function deleteAllTourData() {
  try {
    await Tour.deleteMany();
    console.log('Deleted all tour data');
    // uploading new data after deletion
    uploadTourData();
  } catch (err) {
    console.log(err.message);
  }
}
