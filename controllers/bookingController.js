const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
// after passing the key will get methods to work with
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)

class BookingController {

  getCheckoutSession = catchAsync(async(req, res, err) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    // console.log('address' ,`${req.protocol}://${req.get('host')}`)
    
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      // general info about session
      // the only option to pay in stripe
      payment_method_types: ['card'],
      mode: 'payment',
      // as soon as the payment was charged
      // not secure at all and everyone can book a tour without a pay
      // we go to the path / and works middleware
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
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
              images: [`/img/tours/tour-63f4b1f7ef9984eab72195cf-1676987085622-cover.jpeg`],
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

  createBookingCheckoout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query
    // temporary solution because it is unsecure everyone can make bookings
    if (!tour && !user && !price) return next() 
    await Booking.create({ tour, user, price })


    // making a little secure with the redirect clear through closure 
    // 1 calling 1 time createBooking then redirecting without params to the same path
    // exit throught the next
    res.redirect(req.originalUrl.split('?')[0])
  })

  createBooking= factory.createOne(Booking)
  getBooking = factory.getOne(Booking, { path: 'tour', select: 'name'})
  getAllBooking = factory.getAll(Booking)
  updateBooking = factory.updateOne(Booking)
  deleteBooking = factory.deleteOne(Booking)
}

module.exports = new BookingController();