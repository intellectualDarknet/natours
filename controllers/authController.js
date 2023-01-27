const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// there are 2 authentification for on the server side and client side

class AuthController {
  signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });

    // создаем токен по id 2 переменная секрет 3 обьект где указываем дату окончания

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // добавим token
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  });
}

module.exports = new AuthController();
