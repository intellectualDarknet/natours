const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')
const multer = require('multer');
const AppError = require('../utils/appError');
const sharp = require('sharp')

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, 'public/img/users')
  },
  filename: (req, file, cb) => {

    const ext = file.mimetype.split('/')[1]
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const multerMemoStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {

  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false)
  }

}

const upload = multer({
  storage: multerMemoStorage,
  fileFilter: multerFilter
})

class UserController {

  uploadUserPhoto = upload.single('photo')

  resizeUserPhoto = (req, res, next) => {

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    if (!req.file) return next()

    sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality : 90})
      .toFile(`public/img/users/${req.file.filename}`)

    next()
  }

  getAllUsers = factory.getAll(User)
  getUser = factory.getOne(User);
  updateUser = factory.updateOne(User)
  updateMe = factory.updateOne(User)

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
