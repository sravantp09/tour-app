const fs = require('fs');
const express = require('express');
const router = express.Router();

// reading tours data (executed only once)(blocking code)
let toursInfo = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'),
);

router
  .route('/')
  // get all tours information
  .get((req, res) => {
    if (!toursInfo || toursInfo.length === 0)
      return res.status(404).json({
        status: 'error',
        message: 'data not found',
      });

    // Jsend format for response
    return res.status(200).json({
      status: 'success',
      results: toursInfo?.length,
      data: { tours: toursInfo },
    });
  })
  // creating new tour
  .post((req, res) => {
    const newTourId = toursInfo[toursInfo.length - 1].id + 1;
    const newTour = {
      id: newTourId,
      ...req.body,
    };
    toursInfo.push(newTour);

    // updating tours file
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(toursInfo),
      (err) => {
        if (err) {
          return res.status(404).json({
            status: 'error',
            message: 'unable to create new tour',
          });
        }
        return res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      },
    );
  });

router
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;

    const reqTour = toursInfo.find((tour) => tour.id == id);

    if (!reqTour) {
      return res.status(404).json({
        status: 'error',
        message: 'invalid id',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        tour: reqTour,
      },
    });
  })
  .delete((req, res) => {
    const { id } = req.params;

    if (id > toursInfo.length) {
      return res.status(404).json({
        status: 'error',
        message: 'unable to find the resource',
      });
    }

    toursInfo = toursInfo.filter((tour) => tour.id != id);

    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(toursInfo),
      (err) => {
        if (err) {
          return res.status(404).json({
            status: 'error',
            message: 'error while deleting resource',
          });
        }

        return res.status(204).json({
          status: 'success',
          data: null,
        });
      },
    );
  });

module.exports = router;
