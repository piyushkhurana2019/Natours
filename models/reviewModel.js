const mongoose = require('mongoose');
const validator = require('validator');
// const User = require('./userModels'); 

const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: [true,'Please write the review']
    },

    rating:{
        type: Number,
        min: 1,
        max: 5
    },

    createdAt:{
        type: Date,
        default: Date.now()
    },

    tour:{
        type: mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour']
    },

    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must be written by a User']
    }

},
{
    toJSON:{ virtuals:true}, 
    toObject:{ virtuals:true}       
});

reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:'name',    //ye populate krne se mess create ho rha tha tour k andr review review k andr phir tour then tour k andr guides
    this.populate({
        path:'user',
        select: 'name'
    })
    next();
});


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;