const AppError = require('../utils/appError');

function sendErrorDev(err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function sendErrorProd(err, res) {
  // Operational, trusted error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // programming or unknown error
  } else {
    console.log('ERROR :', err);

    // sending generic message to the client
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
}

function handleCastError(err) {
  return new AppError(`Invaid ${err.path} : ${err.value}`, 404);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.name = err.fullError.name || undefined;
  err.path = err.fullError.path || undefined;
  err.value = err.fullError.value || undefined;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastError(err);
    sendErrorProd(err, res);
  }
};
