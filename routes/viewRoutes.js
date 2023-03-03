const express = require('express');
const ViewsController = require('../controllers/viewController.js')
const AuthController = require('../controllers/authController.js');
const BookingController = require('../controllers/bookingController.js');
const LoginController = require('../controllers/loginController');

const router = express.Router()

router.get('/', AuthController.isLoggedIn, ViewsController.getOverview)

router.get('/login', AuthController.isLoggedIn, LoginController.getLoginForm)
router.get('/signup', LoginController.getSignupForm)
router.get('/tour/:slug',AuthController.isLoggedIn, ViewsController.getTour)
router.get('/me', AuthController.protect, ViewsController.getAccount)
router.get('/my-tours', AuthController.protect, ViewsController.getMyTours)

router.post('/submit-user-data', AuthController.protect, ViewsController.updateUserData)

module.exports = router; 