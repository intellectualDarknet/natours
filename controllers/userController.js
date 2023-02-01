const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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

  createUser = (req, res) => {
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

  deleteUser = async (req, res) => {
    const user = await User.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({
      status: 'success',
      result: user
    });
  };

  updateMe = async (req, res, next) => {
    // 1) create error if user POSTs password data

    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates.Please use /updateMyPassword.',
          400
        )
      );
    }
    // 2) Update user document
    // save method checks for required field ,
    // find methods wont!

    // DTO
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        updatedUser
      }
    });
  };
}

module.exports = new UserController();
