const express = require('express');
const morgan = require('morgan');
const tourRoute = require('./routes/toursRoute.js');
const userRoute = require('./routes/userRoute.js');

const app = express();

// MIDDLEWARE

// run morgan logger only when we are in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// parsing request body
app.use(express.json());

// making contents inside public directory available public
app.use(express.static(`${__dirname}/public`));

// custom middleware, triggers when request comes
app.use((req, res, next) => {
  console.log('Hello from Middleware...');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  next();
});

// Mounting routes
// tour route
app.use('/api/v1/tours', tourRoute);
// user route
app.use('/api/v1/users', userRoute);

// route that handles all unhandles routes
app.all('*', (req, res, next) => {
  /*
  res.status(404).json({
    status: 'failed',
    message: `Can't find ${req.originalUrl} on this server`,
  });
  */

  // BUILDING ERROR
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'failed';
  err.statusCode = 404;

  next(err); // next with parameter indicates error (skip all other middleware if any after this and go straight to error
  // handling middleware)
});

// ERROR HANDLING MIDDLEWARE

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
