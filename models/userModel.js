const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    Type: String,
    required: [true, 'Please enter username'],
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: [true, 'Please provide user email id'],
    unique: true,
    lowercase: true, // converts email to lowercase
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be atleast 8 characters long'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        if (val.length !== this.password.length) return false;
        if (val !== this.password) return false;

        return true;
      },
      message: "Password didn't match",
    },
  },
});

// User model
const User = mongoose.model('User', userSchema);

module.exports = User;
