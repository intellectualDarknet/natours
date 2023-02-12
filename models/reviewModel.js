// review / rating / createdAt / refTour/ refUser
const mongoose = require('mongoose');
const Tour = require('./tourModel')

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

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // in this case this = Model because it is the static method guy
  const stats = await this.aggregate([
    {
      $match: { tour : tourId }
    },

    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0]?.nRating || 0,
    ratingsAverage: stats[0]?.avgRating?.toFixed(2) || 4.5
  })
  console.log('ReviewFunction', this)
  console.log('stats', stats)
}

// pre -preparing
// post means that this thing is in the collection

//post middleware doesnt have access to next

reviewSchema.post('save', function () {

  
  // this points doc

  // method is avaliable only for the class so 
  // instead of Review we call this constructor
  // because it doesnt exist yet
  // this.constructor points to the model
  
  // method works after the result is saved in the db
  // we dont have access to query so in the post method!
  this.constructor.calcAverageRatings(this.tour)
})

// maybe because save is called on doc
// but findOne is called on the Model

// for update 

reviewSchema.pre(/^findOneAnd/, async function(next) {
  // to get document that is proccessed findOne
  // here this == query
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function(next) {
  // this.findOne will not work here because the query is executed
  // this === query 
  // this.r === to doc
  // this.constructor === this.r.tour

  // lets do it here after saving result in the database
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

// we need to implement thing that 1 user can create only 1 review on each tour so
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review