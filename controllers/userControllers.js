const User = require('../models/userModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


const filterObj = (obj, ...allowedFields)=>{
    const newObj ={};
    Object.keys(obj).forEach(el=>{        // Simply loops through the obj array
        if(allowedFields.includes(el))
        newObj[el]=obj[el];
    });
    return newObj;
}

exports.getAllUsers=catchAsync(async (req,res)=>{
    const users = await User.find(); 


    //SEND RESPONSE
    res.status(200).json({
       status: 'success',
       results: users.length,
       data: {
        users
       }
    });
});

exports.updateMe = catchAsync(async (req, res, next)=>{
    // 1) Create error if user Posts password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates! Please use /updateMyPassword for updating password',400))
    }

    // 2) Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body,'name','email');
    // 3) if not, update the user document

   
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        status: 'success',
        data:{
            user:updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next)=>{
    await User.findByIdAndUpdate(req.user.id, { active: false});

    res.status(204).json({
        statu:'success',
        data: null
    });
});


exports.deleteUser=(req,res)=>{
    console.log(req.requestTime);
    res.status(500).json({
       status: 'error',
        message: 'This route is not defined yet'
    })
}
exports.updateUser=(req,res)=>{
    console.log(req.requestTime);
    res.status(500).json({
       status: 'error',
        message: 'This route is not defined yet'
    })
}
exports.addNewUser=(req,res)=>{
    console.log(req.requestTime);
    res.status(500).json({
       status: 'error',
        message: 'This route is not defined yet'
    })
}



exports.getParticularUser=(req,res)=>{
    console.log(req.requestTime);
    res.status(500).json({
       status: 'error',
        message: 'This route is not defined yet'
    })
}