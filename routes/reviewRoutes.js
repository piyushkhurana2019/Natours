const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authControllers');

const router = express.Router({mergeParams: true});     //merge param true krne se dusre router k parameter ki value ko access kiya jata h

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );
 
module.exports = router;
