const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

// many to many usually use refernce not embeding


// there are 2 authentification for on the server side and client side

const createSendToken = (user, statusCode, res) => {
  const token = user.createToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.jWT_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000
    ),
    // cookie can be sent encrypted connection
    //secure: true
    // cant be accessed or midified by browser
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // every time when we send a request we send cookie and new one replace old one

  res.cookie('jwt', token, cookieOptions);

  // to prevent showing password when creating document!
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

class AuthController {
  signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role
    });

    createSendToken(newUser, 201, res);
  });

  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if the email and password exists!

    // return to finish function immediately!
    // fixes the error Cannot set headers after they are sent to the client
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // checking if the user exists and the password is correct

    // В схеме мы автоматом опускаем пароль добавим его в user c помощью
    // select("+field") + cпециально для таких полей
    const user = await User.findOne({ email }).select('+password');

    // together email and password because we wont give the information
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('incorrect password or email'), 401);
    }

    // добавим token
    // Золотое правило что можем сделать в модели делаем в модели а не в контроллере
    // создаем токен по id 2 переменная секрет 3 обьект где указываем дату окончания
    createSendToken(user, 200, res);
  });

  protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check it!

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access', 401)
      );
    }

    // 2) Verification
    // promisify our function to return a promise and and to save it to the

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if userStillExists
    // if the user still exists and dont change his password!

    const freshUser = await User.findById(decoded.value);
    if (!freshUser)
      return next(
        new AppError('The token belonging to this token no longer exists', 401)
      );

    // 4) Check if user changed password after the token was issued
    // issued at from decoded

    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again', 401)
      );
    }
    // Grants access to the middleware
    req.user = freshUser;
    console.log(req.user);
    next();
  });

  restrictTo = (...roles) => {
    return async (req, res, next) => {
      if (!roles.includes(req.user.role))
        next(new AppError('You don`t have permission to do that!', 403));
      next();
    };
  };

  forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on Posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();

    // saving reset timing and another field
    // but there is a thing that save method saves only when
    // all required fiels are filled so we need to remove that behaviour
    await user.save({ validateBeforeSave: false });
    // 3) Send it to user's email

    // from the link to reset the password in email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit your patch request with your new password and passwordConfirm to ${resetURL}.\n If you didn't forget your password please ignore this email!`;
    try {
      sendEmail({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Message',
        email: 'ladyblaumeux24@gmail.com',
        message
      });
    } catch (err) {
      user.createPasswordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending an email try again later', 500)
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Token sent to mail'
    });
  });

  resetPassword = async (req, res, next) => {
    console.log('resetPasswordMethod');
    // 1) get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // this token is the only thing that we know about the user
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() }
    });
    console.log(user);
    // 2) If token has not expired ,and ther is user, set new password
    // checking throung gte

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    // 3 update changed passwordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.log('saved');
    // for everything related to password and
    // user we use method save cause it starts our validators!
    // and middleware functions (encrypt!)

    createSendToken(user, 200, res);
  };

  updatePassword = catchAsync(async (req, res, next) => {
    console.log('update');
    // 1) get user from collection
    const user = await User.findById(req.user.id).select('+password');

    if (
      !user ||
      !(await user.correctPassword(this.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is wrong'), 401);
    }
    // 2) Check if posted password is correct
    console.log('update');
    // 3) If so, update password
    user.password = this.body.password;
    user.passwordConfirm = this.body.passwordConfirm;
    // to work our middlewares and hash password insted of using findOneAndUpdate these methods wont do that
    await user.save();
    // 4) Log user in, send JWT
    console.log('token');
    createSendToken(user, 200, res);
  });
}

module.exports = new AuthController();
