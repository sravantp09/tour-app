const AppError = require('../utils/appError.js');
const User = require('../models/userModel');

async function getAllUsers(req, res) {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (err) {}
}

// updating currently logged in user  details
async function updateMe(req, res, next) {
  try {
    // 1) error if user try to update password (since there is a separate route)
    if (req.body.password || req.body.passwordConfirm) {
      const err = new Error(
        'This route is not for password updation, please use updateMyPassword',
      );
      err.statusCode = 400; // bad request
      throw err;
    }
    const { id } = req.user;

    const user = await User.findById(id).select('+password');

    if (!user) {
      const err = new Error('Not user found, please try again!');
      err.statusCode = 400;
      throw err;
    }

    // update logic (USER CAN ONLY UPDATE NAME AND EMAIL)
    if (req.body.name && req.body.name !== user.name) {
      user.name = req.body.name;
    }

    if (req.body.email && req.body.email !== user.email) {
      user.email = req.body.email;
    }

    user.passwordConfirm = user.password; // for making the validation pass, because passwordConfirm is a required field
    await user.save();

    // removing fields that are not required for the user
    user.password = undefined;
    user.passwordConfirm = undefined;
    user.__v = undefined;
    user.passwordChangedAt = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, err.statusCode, err));
  }
}

// delete current logged in user
async function deleteMe(req, res, next) {
  try {
    const { id } = req.user;

    await User.findByIdAndUpdate(id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(
      new AppError('Unable to delete user, please try again!', 400, err),
    );
  }
}

module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
};
