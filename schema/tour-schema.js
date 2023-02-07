const mongoose = require('mongoose');


// every field that is not defined in schema will be ignored
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  rating: {
    type: Number,
    default: 4.5 
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty']
  },
  ratingsAverage: {
    type: Number,
    defauld: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a price']
  },
  description: {
    type: String,
    trim: true
  },

  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],

  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
});
// use only Tour with capital T
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
