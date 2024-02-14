const User = require('../models/userModel.js');
const AppError = require('../utils/appError.js');
const jwt = require('jsonwebtoken');

async function signUp(req, res, next) {
  try {
    // creating a new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // CREATING A JWT TOKEN
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 400, err));
  }
}

async function login(req, res, next) {
  try {
    console.log(req.body);
    const user = await User.findOne({ email: req.body.email });
  } catch (err) {}
}

module.exports = {
  signUp,
  login,
};
