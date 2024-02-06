const express = require('express');
const morgan = require('morgan');
const tourRoute = require('./routes/toursRoute.js');
const userRoute = require('./routes/userRoute.js');

const app = express();

// middleware

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

module.exports = app;
