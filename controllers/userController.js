const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')
const multer = require('multer');
const AppError = require('../utils/appError');

// dest where the images will be saved
// we are not saving in db but in hash
// make through controller
// configure multier to our need creating storage and filter
// we can choose how to keep our info in storage or in memo (Buffer)

// cannot siply set to public
// cb is like next 
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // to define destination need call cb
    // first param is error so
    cb(null, 'public/img/users')
  },
  filename: (req, file, cb) => {
    // user-userid-timestamp.jpeg
    // if we have timestamp at the same time there will be 1 image
    // if user downloads image it ll rewrite the prev one (may be multiple)
    // req.file === file
    const ext = file.mimetype.split('/')[1]
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const multerFilter = (req, file, cb) => {
  // test all kind of files on an image
  // mime type will always start with image for an image so 
  // lets test it 
  if (file.mimetype.startsWith('image')) {
    console.log('starts')
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false)
  }

}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

class UserController {

  uploadUserPhoto = upload.single('photo')

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
