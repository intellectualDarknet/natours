const express = require('express');
const AuthController = require('../controllers/authController');
const BookingController = require('../controllers/bookingController');

const router = express.Router();


// this router will be for the client to get checkout session
router.get(
  '/checkout-session/:tourId',
  AuthController.protect, 
  BookingController.getCheckoutSession
)

module.exports = router;
