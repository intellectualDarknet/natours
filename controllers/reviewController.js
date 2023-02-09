const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModel')

class ReviewController {

  createReview = catchAsync(async (req, res, next) => {

    const review = await Review.create( req.body )
    console.log(review)
    res.status(201).json({
      status: 'success',
      body: review
    })
  })

  getSingleReview = catchAsync(async (req, res, next) => {
    console.log('idddd', req.params.id)
    const review = await Review.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      body: review
    })
  })

  getAllReview = catchAsync(async (req, res, next) => {
    const reviews = await Review.find()
    
    res.status(200).json({
      status: 'success',
      body: reviews
    })
  })
}

module.exports = new ReviewController();
