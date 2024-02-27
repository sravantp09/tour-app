const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); // RATE LIMITER
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp'); // prevent paramter pollution
const tourRoute = require('./routes/toursRoute.js');
const userRoute = require('./routes/userRoute.js');
const reviewRoute = require('./routes/reviewRoute.js');

const globalErrorHandler = require('./controllers/errorController.js');
const AppError = require('./utils/appError.js');

const app = express();

// MIDDLEWARE

// helmet adds http security headers
app.use(helmet());

// run morgan logger only when we are in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limit configuration
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000, // indicate allows 100 reqs from same ip in 1 hour (in ms)
  message: 'Too many requests from this ip, please try again after 1 hour.',
});

// RATE LIMITING  (applying rate limiter to only router that starts with 'api')
app.use('/api', limiter);

// parsing request body
app.use(express.json({ limit: '10kb' })); // max size of body allowed is 10kb

// DATA SANITIZATION (after body has been parsed)
// 1. against NoSQL query injection
app.use(mongoSanitize());

// 2. against XSS (cross site scripting attack)
app.use(xss());

// prevent paramter pollution
app.use(
  hpp({
    // means we don't remove duplicate values for whitelisted values
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'price',
      'difficulty',
    ],
  }),
);

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

app.use('/api/v1/reviews', reviewRoute);

// route that handles all unhandles routes
app.all('*', (req, res, next) => {
  /*
  res.status(404).json({
    status: 'failed',
    message: `Can't find ${req.originalUrl} on this server`,
  });
  */

  // BUILDING ERROR
  /*
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'failed';
  err.statusCode = 404; */

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // next with parameter indicates error (skip all other middleware if any after this and go straight to error
  // handling middleware)
});

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
