const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('../utils/email')

const createSendToken = (user, statusCode, req, res) => {
  const token = user.createToken();
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

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
    });

    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome()

    createSendToken(newUser, 201, req, res);
  });

  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;


    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('incorrect password or email'), 401);
    }

    createSendToken(user, 200, req, res);
  });

  protect = catchAsync(async (req, res, next) => {

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access', 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.value);
    if (!freshUser)
      return next(
        new AppError('The token belonging to this token no longer exists', 401)
      );

    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again', 401)
      );
    }
    req.user = freshUser;
    res.locals.user = freshUser 
    next();
  });

  isLoggedIn = async (req, res, next) => {
    
    let token;
    if (req.cookies.jwt) {
      try {
        token = req.cookies.jwt

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.value);
        if (!currentUser)
          return next();

        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
        res.locals.user = currentUser
        return next();

      } catch(err) {
        console.log(err.stack)
        return next()
      }

    }
    next();
  };

  logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now()),
      httpOnly: true
    })
    res.status(200).json({ status: 'success' })
  }

  restrictTo = (...roles) => {
    return async (req, res, next) => {
      if (!roles.includes(req.user.role))
        next(new AppError('You don`t have permission to do that!', 403));
      next();
    };
  };

  forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit your patch request with your new password and passwordConfirm to ${resetURL}.\n If you didn't forget your password please ignore this email!`;
    try {
      await new Email(user, resetURL).sendPassword()

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
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  };

  updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, req, res);
  });
}

module.exports = new AuthController();
