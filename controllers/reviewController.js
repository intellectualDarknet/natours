const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')

class ReviewController {

  createReview = catchAsync(async (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id
    const review = await Review.create(req.body)
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
    // rewrited getAllReview for both 
    // simple getAllReview and for tour/tourId/reviews
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const reviews = await Review.find(filter)
    
    res.status(200).json({
      status: 'success',
      body: reviews
    })
  })

  deleteReview = factory.deleteOne(Review)
}

module.exports = new ReviewController();
