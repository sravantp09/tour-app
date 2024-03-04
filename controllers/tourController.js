const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel.js');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const { deleteOne, updateOne, createOne } = require('./handlerFactory.js');

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

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    const err = new Error('Not an image, please upload only images.');
    err.statusCode = 400;
    cb(new AppError(err.message, err.statusCode, err), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);

const resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover Image
  // creating name for cover image
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`, (err, info) => {
      //console.log(info);
    });

  // adding cover image name to body so that when updating this will get pick up
  req.body.imageCover = imageCoverFilename;

  // 2) Images (tours)
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (image, i) => {
      const imageFilename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageFilename}`, (err, info) => {
          //console.log(info);
        });

      req.body.images.push(imageFilename);
    }),
  );

  next();
};

async function getAllTours(req, res) {
  try {
    // reading all tours using find() method
    // const tours = await Tour.find().where('duration').gt(10);
    /*
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
    */

    // if sort exist in the query params, modify the query string with sort
    /*if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); // handling multiple sort option (ie, /tours?sort=price,duration)
      toursQuery = toursQuery.sort(sortBy);
    } else {
      toursQuery = toursQuery.sort('-createdAt'); // adding default sort ie, descending order of creation
    }*/

    // limiting fields for the document
    /*
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      toursQuery = toursQuery.select(fields); // select() function will only select mentioned fields
    } else {
      // here we are excluding __v field in the doc by prefixing it by -
      toursQuery = toursQuery.select('-__v');
    }*/

    // setting default value to page and limit (for improving performance over large volume of data)
    /*const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;

    const skip = (page - 1) * limit;

    //  building query
    toursQuery = toursQuery.skip(skip).limit(limit);

    // validation for skipping
    if (req.query.page) {
      const numTours = await Tour.countDocuments(); // getting count of docs in the Tour collection

      if (skip >= numTours) {
        throw new Error("This page doesn't exist"); // this error will be catched by  catch block and send error response
      }
    }*/

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query; // EXECUTING QUERY (returns document)

    return res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
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

async function getTour(req, res, next) {
  try {
    const { id } = req.params;

    // populate is used to fetch user details from the id given to the guides field
    const tour = await Tour.findById(id)
      .populate({
        path: 'guides',
        select: '-__v -passwordChangedAt', // excluding fields
      })
      .populate('review');

    if (!tour) {
      return next(new AppError(`No tour found with id ${id}`, 404));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    // return res.status(404).json({
    //   status: 'failed',
    //   message: err.message,
    // });
    return next(new AppError(err.message, 404, err));
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
/* REPLACED BY CREATEONE FACTORY FUNCTION
async function createTour(req, res, next) {
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
    // return res.status(400).json({
    //   status: 'failed',
    //   message: err.message,
    // });
    return next(new AppError(err.message, 400, err));
  }
  */

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
//}
// ----------------------------------------
/* REPLACED BY FACTOY FUNCTION 

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
    return res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
  */
//----------------------------------------------
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
}*/

/* REPACED BY UPDATEONE FACTORY FUNCTION
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
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
}
*/

// alias router /top-5-cheap [This function prefil query params for this route]
function aliasTopTours(req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

// aggregating pipeline
async function getTourStats(req, res) {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 }, // indicated add 1 for each document so we will get the count
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        // sorting the result of the previous stage ie, $group
        $sort: {
          avgPrice: 1, // 1 indicate ascending order
        },
      },
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
}

// function return number of tours per month in a given year
async function getMonthlyPlan(req, res) {
  try {
    const year = req.params.year * 1; // converting to number

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        // selecting docs with start date between JAN 1 and DEC 31 of the provided YEAR
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          // extracting month from the start date and grouping the result
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' }, // taking name of each tour belongs the the specified month
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0, // making _id not showup in the result
        },
      },
      {
        $sort: { month: 1 }, // sorting result based on month
      },
    ]);

    return res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
}

module.exports = {
  getAllTours,
  createTour: createOne(Tour),
  getTour,
  deleteTour: deleteOne(Tour), // To get the factory function
  updateTour: updateOne(Tour),
  aliasTopTours,
  //checkBody,
  getTourStats,
  getMonthlyPlan,
  uploadTourImages,
  resizeTourImages,
};
