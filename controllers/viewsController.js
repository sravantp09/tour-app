const Tour = require('../models/tourModel.js');
const AppError = require('../utils/appError.js');

exports.getOveriew = async (req, res, next) => {
  try {
    // 1) get all tour data from the tour collection
    const tours = await Tour.find();

    // 2) build the tempate

    // 3) render the template
    return res.status(200).render('overview', {
      title: 'Exciting tours for adventurous people',
      tours,
    });
  } catch (err) {
    console.log(err.message);
    next(new AppError('Not Found', 404, err));
  }
};

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate(
      'review guides',
    );
    return res.status(200).render('tour', { title: `${tour.name} tour`, tour });
  } catch (err) {
    next(new AppError('Not Found', 404, err));
  }
};

exports.getLoginForm = async (req, res, next) => {
  try {
    return res.status(200).render('login', { title: 'Login' });
  } catch (err) {
    console.log(err.message);
    next(new AppError('Not Found', 404, err));
  }
};
