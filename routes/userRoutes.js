const express = require('express');
const UserController = require('./../controllers/userController');
const AuthController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/login', AuthController.login);

router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);
router.patch(
  '/updateMyPassword',
  AuthController.protect,
  AuthController.updatePassword
);
router.patch('/updateMe', AuthController.protect, UserController.updateMe);
// user will became unaccessible but it is still
// okay to use delete method
router.delete('/deleteMe', AuthController.protect, UserController.deleteMe);

router
  .route('/')
  .get(AuthController.protect, UserController.getAllUsers)

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(AuthController.protect, AuthController.restrictTo('user'),UserController.updateMe)
  .delete(AuthController.protect, AuthController.restrictTo('admin'), UserController.deleteUser);

module.exports = router;
