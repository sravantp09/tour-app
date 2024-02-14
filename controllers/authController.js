const User = require('../models/userModel.js');
const AppError = require('../utils/appError.js');

async function signUp(req, res, next) {
  try {
    // creating a new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 400, err));
  }
}

module.exports = {
  signUp,
};
