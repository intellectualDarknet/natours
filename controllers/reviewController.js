const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')

class ReviewController {

  createReview = factory.createOne(Review)

  setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id
    next()
  }

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

  updateReview = factory.updateOne(Review)
  deleteReview = factory.deleteOne(Review)
}

module.exports = new ReviewController();
