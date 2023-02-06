const mongoose = require('mongoose');


// every field that is not defined in schema will be ignored
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  }
});
// use only Tour with capital T
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
