const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price']
  },

  createdAt: {
    type: Date, 
    default: Date.now()
  },
  //  can be done not on the webSite: in reality with cash
  paid: {
    type: Boolean,
    default: true

  }
})

bookingSchema.pre(/^find/, function (next) {
  // generally dont care because there are not be many calls for bookings 
  // because only guides, and admins,
  // will be allowed to do them

  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  })
  
})

const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking