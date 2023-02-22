const express = require('express');
const ViewsController = require('../controllers/viewController.js')
const AuthController = require('../controllers/authController.js');
const BookingController = require('../controllers/bookingController.js');

const router = express.Router()

router.get('/', BookingController.createBookingCheckoout, AuthController.isLoggedIn, ViewsController.getOverview)

router.get('/login',AuthController.isLoggedIn, ViewsController.getLoginForm)
router.get('/tour/:slug',AuthController.isLoggedIn, ViewsController.getTour)
router.get('/me', AuthController.protect, ViewsController.getAccount)

router.post('/submit-user-data', AuthController.protect, ViewsController.updateUserData)

module.exports = router; 