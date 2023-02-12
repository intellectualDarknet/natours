const express = require('express');
const AuthController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
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
  
router.use(AuthController.protect)

router
  .route('/:id')
  .get(AuthController.restrictTo('user'), reviewController.getReview)
  .patch(AuthController.restrictTo('user'), ReviewController.updateReview)
  .delete(AuthController.restrictTo('user'), ReviewController.deleteReview)

module.exports = router;
