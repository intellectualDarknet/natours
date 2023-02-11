const express = require('express');
const AuthController = require('../controllers/authController');
const TourController = require('./../controllers/tourController');
const reviewRouter = require('./rewierRoutes')

const router = express.Router();

// use to hit the exact route!
router.use('/:tourId/reviews', reviewRouter)
// and in there we use simple get method !

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
  .patch(AuthController.protect, AuthController.restrictTo('user'), TourController.updateTour)
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.deleteTour
  );
  


module.exports = router;
