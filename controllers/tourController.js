const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
const multer = require('multer');
const sharp = require('sharp')

const multerMemoStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
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
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
  ])

  resizeTourImages = catchAsync(async (req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next()

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`)

    req.body.images = []
    await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`)
      
      req.body.images.push(filename)
    }))

    next()
  })

  aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

  getAllTours = factory.getAll(Tour)

  getTour = factory.getOne(Tour, { path: 'reviews'})
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

  getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, lanlng, unit } = req.params
    const [lat, lng] = lanlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !lng) next(new AppError('Please provide latitutr and longtitude in the format lat, lng.', 400))

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
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const distances = await Tour.aggregate([
      {
        $geoNear: {
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
