const express = require('express');
const AuthController = require('../controllers/authController');
const ReviewController = require('../controllers/reviewController')

const router = express.Router();

router
  .route('/:id')
  .get(AuthController.protect, ReviewController.getSingleReview)
  
router
  .route('/')
  .get(AuthController.protect, ReviewController.getAllReview)
  .post(AuthController.protect, ReviewController.createReview)

module.exports = router;
