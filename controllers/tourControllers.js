//THIN CONTROLLERS    As low business logic as can be possible as it is linked to nrml user

// const { query } = require('express');
const Tour = require('../models/tourModels');
// const { Query } = require('mongoose');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


// exports.getAllTours= catchAsync(async (req,res,next)=>{



//         //1A) BASIC FILTERING
//         // const queryObj = {...req.query};             //{...} is used to show the element as an object structure
//         // const excludeFields = ['page','sort','limit','fields'];   
//         // excludeFields.forEach(el=> delete queryObj[el]);     //to exclude the extra filters given by user that are not defined yet

//         // // console.log(req.query, queryObj);


//         // //1B) ADVANCE FILTERING
//         // let queryStr = JSON.stringify(queryObj);
//         // queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`);  //hmne console m normally print krwa k dekha toh ota chla ki baaki string same hai bss fron m $ ki kami hai so we replaced
//         // // console.log(JSON.parse(queryStr));
        
//         // //BUILD QUERY
//         // let Query = Tour.find(JSON.parse(queryStr));

//         // 2)Sorting

//         // if(req.query.sort){
//         //     // Query = Query.sort(req.query.sort);  // here we can only sort by one item let say just by price or just by ratings but what if we need to sort 1st about price then about ratings

//         //     // we need to add , in the url after writing sort=price,ratings
//         //     // then we need to replace that comma by a space so that it can be read by our sorting code

//         //     const sortBy = req.query.sort.split(',').join(' ');
//         //     // console.log(sortBy);
//         //     Query = Query.sort(sortBy);
//         // }
//         // else{
//         //     Query = Query.sort('-createdAt')
//         // }

//         // 3) Fields Limiting

//         // if(req.query.fields){
//         //     const fields = req.query.fields.split(',').join(' ');
//         //     Query = Query.select(fields);
//         // }
//         // else{
//         //     Query = Query.select('-__v');          // -__v to select all except __v as it is created by mongoose to use it internally and it is of no use to the user
//         // }

//         // 4) Paging

//         // const Page = req.query.page*1 || 1;  // query m jo page likha jayega vo string m likha jaa rha h toh string hi hoga toh usse convert kiya *1 se int || means by default page 1 rhega if not specified

//         // const Limit = req.query.limit*1 || 100;
//         // const Skip = (Page-1)*Limit;
//         // Query = Query.skip(Skip).limit(Limit); 
//         // // limit means ek page p kitne honge and skip means jonse page p jana chaho vaha tk jane k liye kitne skip krne pdenge ki if page 3 p jana ho toh skip(20) if limit is 10.

//         // if(req.query.page){
//         //     const numTours = await Tour.countDocuments()   //count the no. of documents i.e results i.e. 9 till here or no. of tours
//         //     if(Skip>=numTours) throw new Error('This page is not found');
//         // }


// //////////////////////////////////////////////////////////////////////////////////////////////////////////////

//         //EXECUTE QUERY (we await it here as there are lot of filtering we need to do above like sort, page etc.etc. if we await it there it takes time to complete annd blocks our code there)

//         const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//         const tours = await features.Query; 


//     //SEND RESPONSE
//     res.status(200).json({
//        status: 'success',
//        results: tours.length,
//        data: {
//         tours
//        }
//     });
// });
exports.getAllTours= factory.getAll(Tour);

// exports.getParticularTour = catchAsync(async (req,res, next)=>{

//     // const id = req.params.id*1;                    //as the id in the param or in the url is in the form of string but we need it as an array that is integer therefore multiply by 1 

//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     // .populate({
//     //     path : 'guides',
//     //     select: '-__v -'});
//     // populate hmesha query m hi hota hai but ye sirf issi query m ho rha tha so iska ek pre query middleware bna diya
// if(!tour){
//     return next(new AppError('No tour found with that id',404))
// }

//     //Tour.finfdById is just a short hand for typical mongodb syntax of Tour.findOne({_id: req.params.id })
//     res.status(200).json({
//         status:'Success',
//         data:{
//             tour
//         }
//     });
// });
exports.getParticularTour = factory.getOne(Tour, {path: 'reviews'});

// exports.addNewTour = catchAsync(async (req,res,next)=>{    // IN post method req contains some data that need to be sent but express doesnt itself have property to hold that requested data or to put that body dataon the request, therefore we require some Middleware  
   
 
//         // const newTour = new Tour({})        
//         // newTour.save()

//         const newTour = await Tour.create(req.body);
    
//         res.status(201).json({
//             status: "Success",
//             data:{
//                 tour: newTour
//             }
//         });
// });
exports.createTour = factory.createOne(Tour);



// exports.updateTour = catchAsync(async (req,res,next)=>{ 

   
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,              //to return the newly updated document
//             runValidators: true     //to run again the validators that we defined in the schema
//         });

//         if(!tour)
//         return next(new AppError('No Tour found with that id'));

//         res.status(200).json({
//             status: "Success",
//             message:"Updated successfully",
//             data:{
//                 tour
//             }
    
//         })
// });
exports.updateTour = factory.updateOne(Tour);


// exports.deleteTour =catchAsync(async (req,res, next)=>{

//     const tour = await Tour.findByIdAndDelete(req.params.id); 
//     if(!tour){
//         return next(new AppError('No tour found with that id',404));
//     }
//     res.status(204).json({
//         status: "Success",
//         data:null
//     })
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res,next)=>{
        // aggregation pipeline m no. of stages hoti hai jisse sara data paas hota hai so iski help se hum kuch bhi operations on the data lga skte hai like average max min etc.

        //aggregate function ek array lete hai jisme processes define hote hai     
        const stats = await Tour.aggregate([
            {
            $match: { ratingsAverage : { $gte:4.5 }}
            },
            {
                $group: {
                    // _id: null,//every grp has seperate id here it is null as we want everything in same grp
                    // _id: '$difficulty', // difficulty k basis p result 3 categories m batt jayega i.e. easy, med, difficult

                    _id: {$toUpper:'$difficulty'},  // just write easy med difficult in uppercase 
                    numTours: {$sum: 1},    // every time hr tour k liye numTour m 1 add ho jayega
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min: '$price'},
                    maxPrice: { $max: '$price'}
                }
            },
                {
                $sort: { avgPrice:1}   //1 for ascending and if we want sorting avg price then we have to use avgPrice 
                },
                // {
                // $match:{ _id: {$ne: 'EASY'}}     //just to show pipe m dubara bhi same stages aa skte hai
                // }
            
        ]);
        res.status(200).json({
            status: "Success",
            data:{
                stats
            }
        });          
});

exports.getMonthlyPlan = catchAsync(async (req, res)=>{
    try {
        
        const year = req.params.year*1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'     //startDates m array tha dates ka array k hrr element ka alg se tour bna dega unwind stage
            },
            
            {
                $match: {
                    startDates:{$gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
                }
            },

            {
                $group: {
                    _id :{ $month: '$startDates'},
                    numTourStarts: { $sum: 1},
                    tours:{ $push: '$name'}            // creates the array containing names of the tour
                }
            },

            {
                $addFields:{month: '$_id'}     // month name ki field add krdega jisme _id ki values hongi
            },

            {
                $project:{_id: 0}            //to hide the id from the result
            },

            {
                $sort:{ numTourStarts:-1}     //For Descending
            },

            {
                $limit: 12                //just to set the limits of the turs that we wanna see
            }         

        ])

        res.status(200).json({
            status:"success",
            data:{
                plan
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }
});