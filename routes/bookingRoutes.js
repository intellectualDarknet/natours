const express = require('express');
const authController = require('../controllers/authController');
const AuthController = require('../controllers/authController');
const BookingController = require('../controllers/bookingController');

const router = express.Router();


// this router will be for the client to get checkout session


router.use(AuthController.protect)

router.get('/checkout-session/:tourId', BookingController.getCheckoutSession)

router.get('/', BookingController.getCheckoutSession)

router.use(authController.restrictTo('admin', 'guide', 'lead-guide'))

router.post('/', BookingController.createBooking)
router.get('/all', BookingController.getAllBooking)
router.get('/:id', BookingController.getBooking)
router.patch('/:id', BookingController.updateBooking)
router.delete('/:id', BookingController.deleteBooking)

module.exports = router;
