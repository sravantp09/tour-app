const app = require('./app.js');

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`);
});