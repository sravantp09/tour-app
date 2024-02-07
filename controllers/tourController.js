const fs = require('fs');
const Tour = require('../models/tourModel.js');

// reading tours data (executed only once)(blocking code)
/*
let toursInfo = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
);
*/

// middleware for checking the req.body data
/*function checkBody(req, res, next) {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'error',
      message: 'name, price & duration are required',
    });
  }
  next();
}*/

async function getAllTours(req, res) {
  try {
    // reading all tours using find() method
    // const tours = await Tour.find().where('duration').gt(10);

    const queryObj = { ...req.query }; // creating a copy
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]); // removing excluded fields

    // fix for mongodb operator (adding  $)
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`),
    );

    // if req.query contains value then it wil return values based on that,
    // else return all values
    let toursQuery = Tour.find(queryStr); // BUILDING QUERY

    // if sort exist in the query params, modify the query string with sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); // handling multiple sort option (ie, /tours?sort=price,duration)
      toursQuery = toursQuery.sort(sortBy);
    } else {
      toursQuery = toursQuery.sort('-createdAt'); // adding default sort ie, descending order of creation
    }

    const tours = await toursQuery; // EXECUTING QUERY

    return res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }

  /*
  console.log(req.requestTime);
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
  */
}

async function getTour(req, res) {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);

    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }

  /*
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
  */
}

async function createTour(req, res) {
  // creating a new tour instance
  try {
    // saving data to the db
    const newTour = await Tour.create(req.body);

    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }

  // const tour = new Tour({
  //   name: req.body.name,
  //   rating: req.body.rating,
  //   price: req.body.price,
  // });

  // tour
  //   .save()
  //   .then((doc) => {
  //     console.log('Created a new tour');
  //     return res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: doc,
  //       },
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //     return res.status(404).json({
  //       status: 'error',
  //       message: err.message,
  //     });
  //   });

  /*const newTourId = toursInfo[toursInfo.length - 1].id + 1;
  const newTour = {
    id: newTourId,
    ...req.body,
  };
  toursInfo.push(newTour); */

  // updating tours file
  /*
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
  );*/
}

async function deleteTour(req, res) {
  try {
    const { id } = req.params;

    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
      return res.status(404).json({
        status: 'failed',
        message: 'No tour found',
      });
    }

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.log(err.message);

    return res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }

  /*
  if (id > toursInfo.length) {
    return res.status(404).json({
      status: 'error',
      message: 'unable to find the resource',
    });
  }

  toursInfo = toursInfo.filter((tour) => tour.id != id);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
  */
}

async function updateTour(req, res) {
  try {
    const { id } = req.params;

    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true, // indicate return new document
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        status: 'failed',
        message: 'No tour found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
}

module.exports = {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  //checkBody,
};
