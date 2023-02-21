const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
const multer = require('multer');
const sharp = require('sharp')

const multerMemoStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    console.log('starts')
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false)
  }

}

const upload = multer({
  storage: multerMemoStorage,
  fileFilter: multerFilter
})

class TourController {

  uploadTourImages = upload.fields([
    // mix of the elements image cover 1 and 3 images
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
  ])

  // in other case if we have multiple same elems req.file
  // upload.array('images', 5) req.files

  resizeTourImages = catchAsync(async (req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next()

    // 1) Cover image
    // saving field in the db
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`)

    req.body.images = []
    // Promise all or const of 
    await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        // put file in public db
        .toFile(`public/img/tours/${filename}`)
      
      req.body.images.push(filename)
    }))

    //  all the fields of Model update method
    // here we just pass all the info into the fields


    next()
  })

  aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

  getAllTours = factory.getAll(Tour)

  getTour = factory.getOne(Tour, { path: 'reviews' })
  createTour = factory.createOne(Tour)
  updateTour = factory.updateOne(Tour)
  deleteTour = factory.deleteOne(Tour)

  getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  });

  getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  });

// /tours-distance?distance=233,center=-40,45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi this path is cleaner so
//  35.479862, 139.300207

  getToursWithin = catchAsync(async (req, res, next) => {
    // getting the params from this thing
    const { distance, lanlng, unit } = req.params

    const [lat, lng] = lanlng.split(',')

    // average radius of the earth in miles or km
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !lng) next(new AppError('Please provide latitutr and longtitude in the format lat, lng.', 400))

    console.log(distance, lat, lng,  unit)

    const tours = await Tour.find({ 
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] }} 
    })
    res.status(200).json({
      status: 'success',
      results: tours.length,
      tours
    })
  })
  
  getDistances = catchAsync(async ( req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    if (!lat || !lng) next(new AppError('Please provide latitutr and longtitude in the format lat, lng.', 400))

    // for geospartial aggregation there is only 1 single stage
    // geoNear

    // convertions to miles kirometrs
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          // from which to calculate the distances?
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      distances
    })
  })
}

module.exports = new TourController();
