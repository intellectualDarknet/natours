const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')

class TourController {
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
}

module.exports = new TourController();
