const mongoose = require('mongoose');
const validator = require('validator');
// const User = require('./userModels'); 
const Tour = require('./tourModels');

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


reviewSchema.statics.calcAverageRating = async function(tourId){
  const stats = await this.aggregate([          //statics method gives us the acces to use this but instance method doensn't
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum:1 },
                avgRating : {$avg: '$rating'}
            }
        }
    ]);
    console.log(stats);

    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};
    reviewSchema.post('save',function(){     //post bcz tb tk saare review store ho chuke honge pre m nhi hua hoga current vala reh jayega and post middleware doesnt get access to next 
        //this points to current review
        this.constructor.calcAverageRating(this.tour);  // to call the function constructor se phle model which is 'this' in this case
    });

    //findByIdAndUpdate
    //findByIdAndDelete

    reviewSchema.pre(/^findOneAnd/, async function(next){  // one prblm:- that abhi data save hone se phle ka time h toh idhr hm calcAvgRating nhi call kr skte but for that hum pre ko post m convert kr skte h but if aisa kiya toh hmare paas fr querry ka access nhi reh payega so ek dusra post middleware bnao
        // const r = await this.findOne();    // const nhi use kiya bcz we need to pass this r's value to the next middleware
        this.r = await this.findOne();    // this,r krne p hum ek middleware se dusre p bhej skte h
        console.log(this.r);
        next();
    })

    reviewSchema.post(/^findOneAnd/, async function(){
       await this.r.constructor.calcAverageRating(this.r.tour);  // in this case this.r is the model
    });



const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;