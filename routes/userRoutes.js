const express = require('express');
const UserController = require('./../controllers/userController');
const AuthController = require('./../controllers/authController');

const router = express.Router();



router.post('/signup', AuthController.signUp);
router.get('/logout', AuthController.logout);
router.post('/login', AuthController.login);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);


router.use(AuthController.protect)

router.patch('/updateMyPassword', AuthController.updatePassword);

router.get('/me', UserController.getMe, UserController.getUser)
router.patch('/updateMe', UserController.uploadUserPhoto,UserController.resizeUserPhoto, UserController.updateMe);

router.delete('/deleteMe', UserController.deleteMe);

router.use(AuthController.restrictTo('admin'))

router
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser)

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(AuthController.restrictTo('user'),UserController.updateMe)
  .delete(AuthController.restrictTo('admin'), UserController.deleteUser);

module.exports = router;
