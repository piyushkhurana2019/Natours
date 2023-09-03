const express = require('express');
const fs = require('fs');
const app = express();
const router = express.Router();
const tourController = require('../controllers/tourControllers')
const authController = require('../controllers/authControllers');

// router.param('id',(req,res,next,val)=>{      // this is a middleware therefore next variable and value of id i.e. the only param at this point is stored in val
//     console.log(`tour id is ${val}`);
//     next();
// })

// router.param('id');  //this will remove repeated lines of code that we need to check on delete, patch,get user

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours)   //hum chahte hai ki ye call hone se phle mere req url m limit =5, sort=price,ratngsAverage, fit ho jaye so we uses the concept of middleware

router
.route('/monthly-plan/:year')
.get(tourController.getMonthlyPlan);

router
.route('/tour-stats')
.get(tourController.getTourStats);

router
.route('/')
.get(authController.protect, tourController.getAllTours)
.post(tourController.addNewTour);

router
.route('/:id')
.get(tourController.getParticularTour)
.patch(tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.deleteTour);

module.exports = router;