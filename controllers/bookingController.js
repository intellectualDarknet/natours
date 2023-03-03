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

    console.log('address' ,`${req.protocol}://${req.get('host')}`)
    
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,

      // general info about session
      // the only option to pay in stripe
      payment_method_types: ['card'],
      mode: 'payment',
      // as soon as the payment was charged
      // not secure at all and everyone can book a tour without a pay
      // we go to the path / and works middleware
      success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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
              images: [`${location.host}/img/tours/${tour.imageCover}`],
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

  createBookingCheckout = async session => {
    // this data is stored in session now!
    const tour = session.client_reference_id
    const user = (await User.findOne({ email: session.customer_email })).id
    const price = session.line_items[0].amount / 100
    await Booking.create({ tour, user, price })

  }


  webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature']
    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err) {
      return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if (event.type === 'checkout.session.complete') createBookingCheckout(event.data.object)
   
    res.status(200).json({ received: true })
  }

  createBooking= factory.createOne(Booking)
  getBooking = factory.getOne(Booking, { path: 'tour', select: 'name'})
  getAllBooking = factory.getAll(Booking)
  updateBooking = factory.updateOne(Booking)
  deleteBooking = factory.deleteOne(Booking)
}

module.exports = new BookingController();