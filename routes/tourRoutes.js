const express = require('express');
const AuthController = require('../controllers/authController');
const TourController = require('./../controllers/tourController');
const reviewRouter = require('./rewierRoutes')

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter)

router
  .route('/top-5-cheap')
  .get(TourController.aliasTopTours, TourController.getAllTours);

router.route('/tour-stats').get(TourController.getTourStats);
router.route('/monthly-plan/:year').get(AuthController.protect,AuthController.restrictTo('admin', 'lead-guide', 'guide'), TourController.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:lanlng/unit/:unit')
  .get(TourController.getToursWithin)

router
  .route('/distances/:latlng/unit/:unit')
  .get(TourController.getDistances)

router
  .route('/')
  .get(AuthController.protect, TourController.getAllTours)
  .post(AuthController.protect, AuthController.restrictTo('admin', 'lead-guide') ,TourController.createTour);

router
  .route('/:id')
  .get(TourController.getTour)
  .patch(AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.uploadTourImages,
    TourController.resizeTourImages,
    TourController.updateTour)
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.deleteTour
  );
  


module.exports = router;
