const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)

class BookingController {

  getCheckoutSession = catchAsync(async(req, res, err) => {
    const tour = await Tour.findById(req.params.tourId)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://natours-2x9t.onrender.com/img/tours/${tour.imageCover}`],
            },
          },
        },
      ],
    })

    res.status(200).json({
      status: 'success',
      session
    })
  })

  webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const tour = session.client_reference_id;
        const user = (await User.findOne({ email: session.customer_email })).id;
        const price = session.amount_total / 100;  
        const newBooking = await Booking.create({ tour, user, price });
        res.status(200).json({ 
          received: true,
          newBooking
        });
      } else {
        res.status(200).json({ received: true })
      }
    } catch (e) {
      res.status(400).json({ 
        received: true,
        e: e.stack
      });
    }

    
   
  }

  createBooking= factory.createOne(Booking)
  getBooking = factory.getOne(Booking, { path: 'tour', select: 'name'})
  getAllBooking = factory.getAll(Booking)
  updateBooking = factory.updateOne(Booking)
  deleteBooking = factory.deleteOne(Booking)
}

const createBookingCheckout = async session => {
  const tour = session.client_reference_id
  const user = (await User.findOne({ email: session.customer_email })).id
  const price = session.display_items[0].amount / 100

  const newTour = await Booking.create({ tour, user, price })

  res.status(200).json({ 
    received: true,
    newTour
  });
}

module.exports = new BookingController();