const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 8000;

// reading tours data (executed only once)(blocking code)
const toursInfo = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'),
);

// middleware
app.use(express.json());

// get all tours information
app.get('/api/v1/tours', (req, res) => {
  if (!toursInfo || toursInfo.length === 0)
    return res.status(404).json({
      status: 'error',
      message: 'data not found',
    });

  // Jsend format for response
  return res.status(200).json({
    status: 'success',
    results: toursInfo?.length,
    data: { tours: toursInfo },
  });
});

// creating new tour
app.post('/api/v1/tours', (req, res) => {
  const newTourId = toursInfo[toursInfo.length - 1].id + 1;
  const newTour = {
    id: newTourId,
    ...req.body,
  };
  toursInfo.push(newTour);

  // updating tours file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursInfo),
    (err) => {
      if (err) {
        return res.status(404).json({
          status: 'error',
          message: 'unable to create new tour',
        });
      }
      return res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
});

// get tour with given id
app.get('/api/v1/tours/:id', (req, res) => {
  const { id } = req.params;

  const reqTour = toursInfo.find((tour) => tour.id == id);

  if (!reqTour) {
    return res.status(404).json({
      status: 'error',
      message: 'invalid id',
    });
  }

  return res.status(200).json({
    status: 'success',
    data: {
      tour: reqTour,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`);
});
