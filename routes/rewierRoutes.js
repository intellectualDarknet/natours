const express = require('express');
const AuthController = require('../controllers/authController');
const ReviewController = require('../controllers/reviewController')

// POST /tour/234sssdd/reviews
// POST /reviews

// by default router have access to only their route so we need to enable
// so this how our route get params in tourRoutes .js
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(ReviewController.getAllReview)
  .post(AuthController.protect, AuthController.restrictTo('user'), ReviewController.setTourUserIds, ReviewController.createReview)
  
router
  .route('/:id')
  .patch(AuthController.protect, AuthController.restrictTo('user'), ReviewController.updateReview)
  .delete(AuthController.protect, AuthController.restrictTo('admin'), ReviewController.deleteReview)

module.exports = router;
