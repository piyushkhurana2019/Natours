const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authControllers');

const router = express.Router({mergeParams: true});     //merge param true krne se dusre router k parameter ki value ko access kiya jata h

router.use(authController.protect);  // From this omwards Everything is authenticated
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
 
  router.route('/:id').get(reviewController.getParticularReview ).patch(authController.restrictTo('user','admin'),reviewController.updateReview ).delete(authController.restrictTo('user','admin'),reviewController.deleteReview);
module.exports = router;
