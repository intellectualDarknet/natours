// review / rating / createdAt / refTour/ refUser
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

reviewSchema.pre(/^find/, function(next) {
  
    // there is no need to do it in all tours it affects perfomance
    // and we ll have chain of 3 populates because if we try 
    // so the solution now is to remove population to break the chain
    // we do it according to the application!

  // this.populate({
  //   path: 'tour',
  //   select: 'name, photo'
  // });
  next()
})


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review