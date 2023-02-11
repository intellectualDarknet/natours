const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFields) => {
  const returningObj = {};
  allowedFields.forEach(elem => {
    returningObj[elem] = obj[elem];
  });
  return returningObj;
};

class UserController {
  getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  });

  getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

  updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

  deleteUser = factory.deleteOne(User)

  updateMe = factory.updateOne(User)

  deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}

module.exports = new UserController();
