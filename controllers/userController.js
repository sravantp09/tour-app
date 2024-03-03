const multer = require('multer');
const AppError = require('../utils/appError.js');

// configuring multer storage
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/users');
  },

  // determines the filename when storing the file
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  },
});

// checks if the file is an image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    const err = new Error('Not an image, please upload only images.');
    err.statusCode = 400;
    cb(new AppError(err.message, err.statusCode, err), false);
  }
};

// configuring multer with destination folder for storing (in disc)
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// multer middleware
exports.uploadUserPhoto = upload.single('photo'); // [ 'photo' here means the field in the form data]

const User = require('../models/userModel');
const { deleteOne, getOne } = require('./handlerFactory.js');

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

    // storing the user photoname in the db
    if (req.file) {
      user.photo = req.file.filename;
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

// function for getting currently logged in user details
// here since we have getOne factory function for getting doc using id, we simply call this middleware to set the id params
// so that getOne can operate without error
exports.getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// module.exports = {
//   getAllUsers,
//   updateMe,
//   deleteMe,
//   deleteUser: deleteOne(User),
//   getOneUser: getOne(User),
// };

exports.getAllUsers = getAllUsers;
exports.updateMe = updateMe;
exports.deleteMe = deleteMe;
exports.deleteUser = deleteOne(User);
exports.getOneUser = getOne(User);
