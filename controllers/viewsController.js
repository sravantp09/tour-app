const Tour = require('../models/tourModel.js');
const AppError = require('../utils/appError.js');

exports.getOveriew = async (req, res, next) => {
  try {
    // 1) get all tour data from the tour collection
    const tours = await Tour.find();

    // 2) build the tempate

    // 3) render the template
    return res.status(200).render('overview', { title: 'All Tours', tours });
  } catch (err) {
    console.log(err.message);
    next(new AppError('Not Found', 404, err));
  }
};

exports.getTour = (req, res) => {
  res.status(200).render('tour');
};
