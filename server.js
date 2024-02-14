require('dotenv').config({ path: '.env' });

// catches all uncaught errors in synchronous code (inorder to catch error it must be before the error happening)
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION, Shutting down...');
  console.log(err.name, '-', err.message);
  process.exit(1);
});

const app = require('./app.js');
const mongoose = require('mongoose');

const DB_CONNECTION = process.env.DB_CONNECTION;
const PORT = process.env.PORT || 8000;

// connection to the database
mongoose.connect(DB_CONNECTION).then((connection) => {
  console.log('Database Connected...');
});
// .catch((err) => {
//   console.log(err.message);
// });

const server = app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`);
});

// HANDLING UNHANDLED REJECTIONS (global)
// this gets executed when there is an unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  // exiting application
  console.log('Shutting the App...');

  // giving time process pending requests if any before exiting the server
  server.close(() => {
    process.exit(1); // 1 - uncaught exception
  });
});

//console.log(x)  - throws error  because x is not define and it will be handled by uncaughtException handler
