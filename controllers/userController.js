const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

class UserController {
  getAllUsers = factory.getAll(User)
  getUser = factory.getOne(User);
  updateUser = factory.updateOne(User)
  // error
  updateMe = factory.updateOne(User)

  // mb the same in methods
  deleteUser = factory.deleteOne(User)
  deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
  }

  createUser = factory.createOne(User)
}

module.exports = new UserController();
