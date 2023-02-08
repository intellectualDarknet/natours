const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

// fat models thin controlles ideology!

// every field that is not defined in schema will be ignored


// 4 types of middleware in mongoose 
// document, query, aggregate , model
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description']
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
    default: Date.now(),
    // this field will not be showed by 
    // Schema.find ... methods
    select: false
  },
  startDates: [Date]
}, {
  // Each time the data is outputted in json 
  // virtuals will be in there!
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// technically they are not the part of the database so 
// we cant query them! use in find({})
tourSchema.virtual('durationWeeks').get(function() {
  // duration in weeks
  return this.duration / 7
})

// use only Tour with capital T

// runs before document saved to db
// .save() and .create() methods but not insertMany()
tourSchema.pre('save', function(next) {
  // sligify simpletransformer of text
  // converts to lowercase in this case

  this.slug = slugify(this.name, { lower: true })
  // will call the next middleware in a row or we ll stuck
  next() 
})

// middleware (hooks)
tourSchema.pre('save', function(next) {
  console.log('Will save document...')
  next()
})

// post middleware function executies after all pre middlewares
tourSchema.post('save', function(doc, next) {
  console.log(doc)
  // wil log our document
  next()
})

const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;
