const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 8000;

// reading tours data (executed only once)(blocking code)
const toursInfo = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'),
);

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

app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`);
});
