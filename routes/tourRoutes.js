const express = require('express');
const AuthController = require('../controllers/authController');
const TourController = require('./../controllers/tourController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

// router.param('id', TourController.checkID);

router
  .route('/top-5-cheap')
  .get(TourController.aliasTopTours, TourController.getAllTours);

router.route('/tour-stats').get(TourController.getTourStats);
router.route('/monthly-plan/:year').get(TourController.getMonthlyPlan);
  // при вызове метода сначала выполняется AuthController потом TourController

  // таким же образом скорее всего и формируются роли и т
router
  .route('/')

  .get(AuthController.protect, TourController.getAllTours)
  .post(TourController.createTour);

router
  .route('/:id')
  .get(TourController.getTour)
  .patch(TourController.updateTour)
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.deleteTour
  );
  
  // when there is a clear parent-child relationship between resourses
  // it is clearly the case here
  //      tour/tourID/review/reviewID 
  // post tour/234fad4/review
  // get  tour/234fad4/review
  // get  tour/234fad4/review/rsefsefesfes
  // rewriting router according to the schema connection!
  
router.route('/:tourId/reviews')
  .post(AuthController.protect, AuthController.restrictTo('user'), reviewController.createReview)

module.exports = router;
