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
  return new AppError(`Invaid ${err.path} : ${err.value}`, 400);
}

function handleDuplicateFieldsDB(err) {
  // finding the text from the error message
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0].slice(1, -1);
  return new AppError(
    `Duplicate Field value: ${value}, please use another value`,
    400,
  );
}

function handleValidationError(err) {
  // extracting error message from the error (since there can be mutiple validation error)
  const errors = Object.values(err.fullError.errors).map(
    (error) => error.properties.message,
  );
  const msg = `Invalid input data, ${errors.join('. ')}`;
  return new AppError(msg, 400);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.name = err.fullError?.name || 'undefined';
  err.path = err.fullError?.path || undefined;
  err.value = err.fullError?.value || undefined;
  err.code = err.fullError?.code || undefined;
  err.message = err.fullError?.message || 'Route not defined';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastError(err);

    if (err.code === 11000) err = handleDuplicateFieldsDB(err);

    if (err.name === 'ValidationError') err = handleValidationError(err);

    sendErrorProd(err, res);
  }
};
