require('dotenv').config({ path: '.env' });
const app = require('./app.js');
const mongoose = require('mongoose');

const DB_CONNECTION = process.env.DB_CONNECTION;
const PORT = process.env.PORT || 8000;

// connection to the database
mongoose
  .connect(DB_CONNECTION)
  .then((connection) => {
    console.log('Database Connected...');

    // starting server only after successful db connection
    if (connection) {
      app.listen(PORT, () => {
        console.log(`Server is running on Port : ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log(err.message);
  });

// schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price'],
  },
});

// model
const Tour = mongoose.model('Tour', tourSchema);
