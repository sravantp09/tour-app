const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const PASSWORD_SALT = 12;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
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
      // works only on create and save
      validator: function (val) {
        if (val.length !== this.password.length) return false;
        if (val !== this.password) return false;
        return true;
      },
      message: "Password didn't match",
    },
  },
});

// for encrypting password before saving (using document middleware)
userSchema.pre('save', async function (next) {
  try {
    // skipping encryption if password is not modified, ie we update other field but not password
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, PASSWORD_SALT);

    // because we don't need passwordConfirm in the db, this field is only for validation
    this.passwordConfirm = undefined;

    next();
  } catch (err) {
    console.log(err.message);
  }
});

// User model
const User = mongoose.model('User', userSchema);

module.exports = User;