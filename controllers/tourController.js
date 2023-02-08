const fs = require('fs');
const Tour = require('../schema/tour');
const APIFeatures = require('../utils/api-features')


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficuilty'
  next()
}

exports.getAllTours = async (req, res) => {
  try {
    const tours = await new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    res.status(200).json({
      status: 'success',
      data: { tours }
    });
  } catch(error) {
    res.status(404).json({
      status: 'fail',
      message: error
    })
  }
};

exports.getTour = async (req, res) => {
  try {
    // findById the same thing as find({ _id: value})
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
 
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        newTour
      }
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: "Invalid data set",
      error: err
    })
  }

};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });
  } catch(e) {
    res.status(400).json({
      status: 'fail',
      message: "Invalid data set"
    })
  }

};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: deletedTour
    });
  } catch(error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const result = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // what we want to group by
          // we want to have everyting in one group
          // we can calculate statistics for all tours together
          // and not separate by groups
  
          // if we would group by difficulty we ll have average
          // value for easy , hard etc values!
            // _id: null,
            _id: null,// сведет все в кучу
            // выведет сложность в upper 
             _id: { $toUpper: '$difficulty'}, 
            // кол-во посчитаных туров
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            // среднее количество
            avgRating: { $avg: '$ratingsAverage'},
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
        }
        // значения в _id собирает результаты с уникальными
        // комбинациями имеющихся значений в _id
      },
      {
        // 1 asc -1 desc
        //stages can be repeated
        $sort: { avgPrice: 1 }
      }
      // not equal to easy
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }

    ]);
    console.log('stat',' result', result)
    res.status(200).json({
      status: 'success',
      data: 
        result
    });
  } catch(error) {
    console.log(error)
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year

    const plan = await Tour.aggregate([
      {
        // deconstruct array into single 
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
          // gather all names of the tours with the same month
          tours: { $push: '$name'}
        }

      },
      // adding field
      {
        $addFields: { month: '$_id' }
      },
      {
        // showing _id is a bad practice so 
        $project: {
          // _id wont be shown!
          _id: 0,
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      // show only 6 elements!
      {
        $limit: 6
      }
    ])
    console.log('plan', plan)

    res.status(200).json({
      status: 'success',
      data: plan
    })
  } catch(error) {
    res.status(404).json({
      status: 'fail',
      message: error
    })
  }
}
