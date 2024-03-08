const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); // RATE LIMITER
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp'); // prevent paramter pollution
const cors = require('cors');
const tourRoute = require('./routes/toursRoute.js');
const userRoute = require('./routes/userRoute.js');
const reviewRoute = require('./routes/reviewRoute.js');
const viewRoute = require('./routes/viewRoute.js');

const globalErrorHandler = require('./controllers/errorController.js');
const AppError = require('./utils/appError.js');

const app = express();

// USING PUG AS VIEW ENGINE
app.set('view engine', 'pug');
// Specifying where we placed all the templates/views
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE

// making contents inside public directory available public
app.use(express.static(path.join(__dirname, 'public')));

// CORS [by default only for GET AND POST]
app.use(cors());

// Enabing CORS for complex request like DELETE, PUT, PATCH
app.options('*', cors());

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

// custom middleware, triggers when request comes
app.use((req, res, next) => {
  console.log('Hello from Middleware...');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  next();
});

/*
app.get('/', (req, res) => {
  res.status(200).render('base', { tour: 'The Forest Hiker' }); // render method render the pug file with name base
});

app.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});

app.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
});
*/

// Mounting routes
// View router
app.use('/', viewRoute);
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

  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      404,
      new Error(`Can't find ${req.originalUrl} on this server`),
    ),
  ); // next with parameter indicates error (skip all other middleware if any after this and go straight to error
  // handling middleware)
});

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
