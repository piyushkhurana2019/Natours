const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req,res, next)=>{

    const doc = await Model.findByIdAndDelete(req.params.id); 
    if(!doc){
        return next(new AppError('No document found with that id',404));
    }
    res.status(204).json({
        status: "Success",
        data:null
    })
});


exports.updateOne = Model => catchAsync(async (req,res,next)=>{ 

   
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,              //to return the newly updated document
        runValidators: true     //to run again the validators that we defined in the schema
    });

    if(!doc)
    return next(new AppError('No document found with that id'));

    res.status(200).json({
        status: "Success",
        message:"Updated successfully",
        data:{ 
            data: doc
        }

    })
});

exports.createOne = Model => catchAsync(async (req,res,next)=>{    // IN post method req contains some data that need to be sent but express doesnt itself have property to hold that requested data or to put that body dataon the request, therefore we require some Middleware  

    // const newTour = new Tour({})        
    // newTour.save()

    const doc = await Model.create(req.body);

    res.status(201).json({
        status: "Success",
        data:{
            data: doc
        }
    });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req,res, next)=>{

    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);

    const doc = await query;

if(!doc){
    return next(new AppError('No document found with that id',404))
}
    res.status(200).json({
        status:'Success',
        data:{
            data: doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req,res,next)=>{

/////////////////////      Just to allow for nested GET reviews on tour(Small Hack)     //////////////////
    let filter = {};      
  if(req.params.tourId) filter = { tour: req.params.tourId };
///////////////////////////////////////////////////////////////////////////////////////////////////////

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    //find () m filter bhi sirf nested get review on tour ko enable krne k liye lgaya h vrna sirf getAlltour k liye nrml find() hi kaafi tha
    // const doc = await features.Query.explain();    just to see the execution stats
    const doc = await features.Query; 

res.status(200).json({
   status: 'success',
   results: doc.length,
   data: {
    data: doc
   }
});
});