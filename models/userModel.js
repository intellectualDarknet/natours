const Jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    // Ограничим возможные значения
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    // установим значение по умолчанию
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    // The password will not return in Schema.find() methods (when we read from DB)!
    select: false
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
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }

});

// срабатывает на любые методы начинающиеся с find!
userSchema.pre(/^find/, function(next) {
  // this points to current query


  this.find({ active: { $ne: false } });
  next();
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
userSchema.pre('save', function(next) {
  // sometimes passwordChangedAT ensures that token created later than password changed

  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// adding method to all instances(documents) from db
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // this.password is unawailable bcause of select: false

  // return true or false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createToken = function() {
  // this.password is unawailable bcause of select: false
  const value = this._id;
  return Jwt.sign({ value }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    // rewrite in seconds
    //
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

//

userSchema.methods.createPasswordResetToken = function() {
  // we don't need that to be strong as password we can use some bites
  // this reset token is a way less dangerous attack vector so we can crypto it way simplier
  const resetToken = crypto.randomBytes(32).toString('hex');

  //
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // we need to save it in schema to compare it in the future with the expires time
  // 10 min = 600s = 600 000 ms
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
