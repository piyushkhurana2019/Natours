const express = require('express');
const fs = require('fs');
const app = express();
const router = express.Router();
const tourController = require('../controllers/tourControllers')
const authController = require('../controllers/authControllers');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

// router.param('id',(req,res,next,val)=>{      // this is a middleware therefore next variable and value of id i.e. the only param at this point is stored in val
//     console.log(`tour id is ${val}`);
//     next();
// })

// router.param('id');  //this will remove repeated lines of code that we need to check on delete, patch,get user


router.use('/:tourId/reviews', reviewRouter)

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours)   //hum chahte hai ki ye call hone se phle mere req url m limit =5, sort=price,ratngsAverage, fit ho jaye so we uses the concept of middleware

router
.route('/monthly-plan/:year')
.get(authController.protect, authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
// hum isko :- tours-within?distance=300&center=-40,50&unit=km  bhi likh skte the but upr vala is more cleaner i.e.:- tours-within/300/center/-40,50/unit/km

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
.route('/tour-stats')
.get(tourController.getTourStats);

router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.createTour);

router
.route('/:id')
.get(tourController.getParticularTour)
.patch(authController.protect, authController.restrictTo('admin','lead-guide'),tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.deleteTour);

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;