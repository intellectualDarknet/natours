const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      // this function will be run each time 
      // that a new value is set for this field 
      set: val => val.toFixed(2)
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
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
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
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON in order to specify location
      type: {
        type: String,
        // can be poligons lines etc
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ]
    },
    guides: [
      // expect the type to be the mongoDB id 
      {
        type: mongoose.Schema.ObjectId,
        // establish reference 
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// 1 ascending order -1 descending order depends on that people usually search for lowest price, greater ratingsAverage
// we create special table like index to decrease amount of
// of documents that are looped through from 9 (all document) to 3 (binary search??)
// so we can now find elems faster
// then we set smth unique it does the same only behind the scenes

// ussual strategy is to set indexes for the fields that are the most queried
// but these new indexes take apr 5 times more memo than entire docs
// each index updates each time the document is updated so if we usually update document, and rarely use searches 
// it is pointless to do that

// if we delete such field we need to remove slug index to
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
// for geospatial data on the earth like sphere 
// fictional points on a simple two dimensional plane
tourSchema.index({ startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});



// AGGREGATION MIDDLEWARE
// it adds aggre match in our query so remove it to geoNear work
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

tourSchema.pre(/^find/, async function(next) {
  this.populate({
    //field
    path: 'guides',
    // remove __v __passwordChangedAt 
    select: '-__v -passwordChangedAt'
  });
  next()
})

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// how can we count we amount of reviews on the tours???
// throught virtual populate!
// keep the information about amount of reviews in tourModel without
// keeping it in database



tourSchema.virtual('reviews', {
  ref: 'Review',
   // link in the field Review to tour
  foreignField: 'tour',
  localField: '_id',
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
