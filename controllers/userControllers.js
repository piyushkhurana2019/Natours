const User = require('../models/userModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, res, cb) => {    //cb here is same as next, we didnt use next here just to differentiate that it is not from express
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);  // for the uniquness of the name of photo that is being created in our folder ek hi id se ek time p ek photo ayegi
//     }
// });

const multerStorage = multer.memoryStorage(); // in this way image get stored in buffer as, sharp require multer to be stored in memory not in disk storage

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
  });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next)=>{
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({
        quality:90
    }).toFile(`public/img/users/${req.file.filename}`)  // image ko buffer m stored krnw se ye way more efficient ho gya hai as if disk hota toh phle disk m store hota then yaha p read hota ab direct memory m store ho rha hai
    next();
};

const filterObj = (obj, ...allowedFields)=>{
    const newObj ={};
    Object.keys(obj).forEach(el=>{        // Simply loops through the obj array
        if(allowedFields.includes(el))
        newObj[el]=obj[el];
    });
    return newObj;
}

// exports.getAllUsers=catchAsync(async (req,res)=>{
//     const users = await User.find(); 


//     //SEND RESPONSE
//     res.status(200).json({
//        status: 'success',
//        results: users.length,
//        data: {
//         users
//        }
//     });
// });
exports.getAllUsers= factory.getAll(User);


exports.getMe = (req, res, next)=>{
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next)=>{

    console.log(req.file);
    console.log(req.body);
    // 1) Create error if user Posts password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates! Please use /updateMyPassword for updating password',400))
    }

    // 2) Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body,'name','email');
    if(req.file) filteredBody.photo = req.file.filename;
    // 3) if not, update the user document

   
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        // runValidators:true
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


// exports.deleteUser=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(500).json({
//        status: 'error',
//         message: 'This route is not defined yet'
//     })
// }
exports.deleteUser= factory.deleteOne(User);
exports.updateUser=factory.updateOne(User);

exports.addNewUser=(req,res)=>{
    console.log(req.requestTime);
    res.status(500).json({
       status: 'error',
        message: 'This route is not defined yet! Please use /signUp Instead!'
    })
}



exports.getParticularUser= factory.getOne(User);