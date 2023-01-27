const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works for create, save! not findOneAndUpdate!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  }
});

// works between getting the data and saving it to DB!
//encryption === hash
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  // Encrypt password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password field
  this.passwordConfirm = undefined;
  next();
});

module.exports = mongoose.model('User', userSchema);
