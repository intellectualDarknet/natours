const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
// after passing the key will get methods to work with
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)

class BookingController {

  getCheckoutSession = catchAsync(async(req, res, err) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    console.log(tour)
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      // general info about session
      // the only option to pay in stripe
      payment_method_types: ['card'],
      mode: 'payment',
      // as soon as the payment was charged
      success_url: `${req.protocol}://${req.get('host')}/`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour${tour.slug}`,
      // 
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      // info about the product
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
          },
        },
      ],
    })

    // 3) Create session as response

    res.status(200).json({
      status: 'success',
      session
    })
  })
}

module.exports = new BookingController();