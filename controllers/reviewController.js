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
    const review = await Review.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      body: review
    })
  })

  getAllReview = factory.getAll(Review)

  getReview = factory.getOne(Review)
  updateReview = factory.updateOne(Review)
  deleteReview = factory.deleteOne(Review)


}

module.exports = new ReviewController();
