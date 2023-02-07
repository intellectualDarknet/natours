const fs = require('fs');
const Tour = require('../schema/tour');


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficuilty'

  // next is needed to move forward otherwise we will stuck.
  next()
}

exports.getAllTours = async (req, res) => {
  try {

    const queryObj = { ...req.query }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    console.log('we ll see here query params { duration:5, difficulty: easy }', req.query)
    excludedFields.forEach(el => delete queryObj[el])


    // two ways of querying in mongoDB
    // const tours = await Tour.find({'duration': 5, 'difficulty': 'easy'})
    // chaining
    // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy')


    //2) Advanced filtering
    // the example of requiest in postman
    // {{UdemyUrl}}tours?price[gte]=500&difficulty=easy&duration[gte]=5
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    // returns query
    let query = Tour.find(JSON.parse(queryStr))

    // 3) Sorting
    // postman example
    // sorting by descending order
    // {{UdemyUrl}}tours?sort=-price,-ratingsAverage
    if (req.query.sort) {
      console.log('sorting', req.query.sort)
      const sortBy = req.query.sort.split(',').join(' ');
      console.log('sortBy', sortBy)
      query = query.sort(sortBy)
    } else {
      // sorting by adding date
      query = query.sort('-createdAt')
    }

    // 4) limiting fields (projecting)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields)
    } else {
      // __v mongo uses it internally
      // -fieldname excluding 
      // postman {{UdemyUrl}}tours?fields=-duration,-__v,-difficulty
      query = query.select('-__v')
    }

    // 5) Pagination
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 100
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)


    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('this page does not exist')
    }

    const tours = await query

    res.status(200).json({
      status: 'success',
      data: {tours}
    });
  } catch(e) {
    res.status(404).json({
      status: 'fail',
      message: e
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
      status: 'success',
      message: error
    });
  }
};
