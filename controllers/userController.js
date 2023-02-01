const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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

  update = async (req, res) => {
    console.log();
  };
}

module.exports = new UserController();
