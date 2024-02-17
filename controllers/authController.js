const { promisify } = require('util');
const User = require('../models/userModel.js');
const AppError = require('../utils/appError.js');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email.js');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

async function signUp(req, res, next) {
  try {
    // creating a new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    // CREATING A JWT TOKEN
    const token = generateToken(newUser._id);

    newUser.password = undefined;

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
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Please provide email id & password');
    }

    const user = await User.findOne({ email }).select('+password'); // since we put select:false in schema, inorder to fetch it we need to specify it explicityly

    // comparing password from client with the one in the db using bcrypt compare function
    const isPasswordCorrect = await user?.checkPassword(
      password,
      user?.password,
    ); // calling instance method

    if (!user || !isPasswordCorrect) {
      throw new Error('Incorrect email id or password');
    }

    // CREATING A JWT TOKEN
    const token = generateToken(user._id);

    return res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    return next(new AppError(err.message, 400, err));
  }
}

// PROTECTED ROUTE(MIDDLEWARE)
async function protect(req, res, next) {
  try {
    let token;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1]; // removing Bearer part
    }

    // if not token sent, then it will throw unauthorized access error like below
    if (!token) {
      const err = new Error(
        'You are not logged In! Please login to get access',
      );
      err.statusCode = 401;
      throw err;
    }

    // token verification (if the token is not verified it will then throw error)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // checking whether the user still exists or not (because there can be cases when token exits but user don't)
    const user = await User.findById(decoded.id);

    if (!user) {
      const err = new Error('User not found, Please signup');
      err.statusCode = 401;
      throw err;
    }

    // Checking if the password has changed after issuing the token (prevent stealing)
    const isChanged = user.changedPasswordAfter(decoded.iat);

    if (isChanged) {
      const err = new Error(
        'User recenty changed the password! Please login again',
      );
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError(err.message, err.statusCode, err));
  }
}

// function that restrict access based on user roles
function restrictTo(...roles) {
  return async function (req, res, next) {
    try {
      //req.user available here because protect function from above runs before this function so there we are setting the user details to req object
      if (!roles.includes(req.user.role)) {
        const err = new Error('Permission denied');
        err.statusCode = 403;
        throw err;
      }

      next();
    } catch (err) {
      return next(new AppError(err.message, err.statusCode, err));
    }
  };
}

async function forgotPassword(req, res, next) {
  try {
    // 1) Getting user using email id
    const { email } = req.body;
    const user = await User.findOne({ email }); // reading user document from the db

    if (!user) {
      const err = new Error('Invalid email id, please try again');
      err.statusCode = 404;
      throw err;
    }

    // 2) Generate random token
    const resetToken = user.createPasswordResetToken(); // this will update the user doc with two new properties related to password token

    // saving changed made to the  user object
    // { validateBeforeSave: false } - prevents running validators again
    await user.save({ validateBeforeSave: false }); // saving after modification

    // creating the reset password url
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password, Submit a PATCH request with password and passwordConfirm to ${resetURL}`;

    try {
      // sending mail
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token, valid for 10 mins only',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to the mail',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('Unable to send mail, please retry later', 500, error),
      );
    }
  } catch (err) {
    return next(new AppError(err.message, err.statusCode, err));
  }
}

function resetPassword(req, res, next) {
  const { token } = req.params;
  console.log(token);
  res.end();
}

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
