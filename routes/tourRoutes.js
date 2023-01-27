const express = require('express');
const AuthController = require('../controllers/authController');
const TourController = require('./../controllers/tourController');

const router = express.Router();

// router.param('id', TourController.checkID);

router
  .route('/top-5-cheap')
  .get(TourController.aliasTopTours, TourController.getAllTours);

router.route('/tour-stats').get(TourController.getTourStats);
router.route('/monthly-plan/:year').get(TourController.getMonthlyPlan);

router
  .route('/')
  // при вызове метода сначала выполняется AuthController потом TourController
  // таким же образом скорее всего и формируются роли и т
  .get(AuthController.protect, TourController.getAllTours)
  .post(TourController.createTour);

router
  .route('/:id')
  .get(TourController.getTour)
  .patch(TourController.updateTour)
  .delete(TourController.deleteTour);

module.exports = router;
