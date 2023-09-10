const { query } = require('express');
const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


// exports.getAllReviews = catchAsync(async (req, res, next) => {

//   let filter = {};     // to get access to the filter
//   if(req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next)=>{

 //// Allow nested Routes  hmne isko yaha alg se isiliye likha setTourUserIds middleware bna k bcz hme isse handlerFactory m use krna tha so generic bnane k liye ye stuff extra tha so middleware bna k routing k time call krdiya

   if(!req.body.tour) req.body.tour = req.params.tourId;
   if(!req.body.user) req.body.user = req.user.id;
   next();
}

// exports.createReview = catchAsync(async (req, res, next) => {

//   //  //// Allow nested Routes

//   //  if(!req.body.tour) req.body.tour = req.params.tourId;
//   //  if(!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getParticularReview = factory.getOne(Review);
