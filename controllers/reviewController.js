const Review = require('../models/reviewModel.js');
const AppError = require('../utils/appError.js');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().select('-__v');

    if (reviews.length === 0) {
      const err = createError('Reviews not found', 404);
      throw err;
    }

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, err.statusCode, err));
  }
}

async function createReview(req, res, next) {
  try {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 400, err));
  }
}

module.exports = {
  getAllReviews,
  createReview,
};
