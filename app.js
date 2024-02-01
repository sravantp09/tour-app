const express = require('express');
const tourRoute = require('./toursRouter.js');

const app = express();
const PORT = 8000;

// middleware
app.use(express.json());

// tour route
app.use('/api/v1/tours', tourRoute);

app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`);
});
