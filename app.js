const path = require('path');
const { json } = require('body-parser');
const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

console.log(process.env.NODE_ENV);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

////////////////////////  Global  MIDDLE WARES   //////////////////////////////////

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests with this Ip, please try again in an hour',
});
app.use('/api', limiter); // jo bhi querry /api se start ho rhi h uspe ye limiter apply hoga means sb p

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Middleware which we talked about
//limit 10kb means body m jp bhi data aayega vo 10 kb se jyada ka ni ho skta

// Data Sanitization against NoSQL querry injection
app.use(mongoSanitize()); // filter out all $ and . signs from query etc.

// Data sanitization against XSS(cross-site scripting attacks)
app.use(xss()); // prevent malicious html code that might contains some js and can damage our website  it simply converts the html code into some other aready asigned values to that particulas html tags

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); // hpp:- http parameter pollution it prevents our querry by duplicate values for eg. getAllTours with sort=time&sort=price it will give error as sort is only defined for one value there hpp prevents it by converting 2 sorts to 1 but we might want some other things like duration difficulty, etc to have multiple values therefore writing them to whitelist

app.use((req, res, next) => {
  console.log('Hello from the MiddleWare Side');
  next();
}); //Format to define our own middleware
//Express m order bohot matter krta h means that ki agr hmne ye middleware get and patch req k bich m rkh diya or fr agr get req call ki toh middleware call ni hoga bcz vp get k niche hoga and of patch req call ki toh mddle ware call ho jyega bcz vo patch k upr hoga

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////////////////////////   ROUTE HANDLERS   //////////////////////////////////
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev_data/data/tours-simple.json`));

// const getAllTours=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(200).json({
//        status: 'success',
//        result: tours.length,
//        RequestTime: req.requestTime,
//        data: {
//            tours
//        }
//     })
// }
// const getAllUsers=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(500).json({
//        status: 'error',
//         message: 'This route is not defined yet'
//     })
// }
// const deleteUser=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(500).json({
//        status: 'error',
//         message: 'This route is not defined yet'
//     })
// }
// const updateUser=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(500).json({
//        status: 'error',
//         message: 'This route is not defined yet'
//     })
// }
// const addNewUser=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(500).json({
//        status: 'error',
//         message: 'This route is not defined yet'
//     })
// }
// const getParticularUser=(req,res)=>{
//     console.log(req.requestTime);
//     res.status(500).json({
//        status: 'error',
//         message: 'This route is not defined yet'
//     })
// }

// const getParticularTour = (req,res)=>{

//     const id = req.params.id*1;                    //as the id in the param or in the url is in the form of string byut e need it as an array that is integer therefore multiply by 1

//     if(id>tours.length){
//     return res.status(404).json({
//         status : "Failed",
//         message: "Could not found this id"
//     })

//     }
//     const tour = tours.find( el=> el.id === id);

//     if(!tour){
//         return res.status(404).json({
//             status : "Failed",
//             message: "Could not found this tour"
//         })

//         }

//      res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//      })
// }

// const addNewTour = (req,res)=>{    // IN post method req contains some data that need to be sent but express doesnt itself have property to hold that requested data or to put that body data on the request, therefore we require some Middleware
//     const newId = tours[tours.length -1].id +1
//     const newTour = Object.assign({id: newId}, req.body)                        //object.assign allows us to create a new object by merging 2 existing objects together

//     tours.push(newTour); // to push the newly added tour into the tour array
//     fs.writeFile(`${__dirname}/dev_data/data/tours-simple.json`,JSON.stringify(tours),err=>{
//         res.status(201).json({
//             status: "Success",
//             data: {
//                 newTour
//             }

//         })
//     })
//     // res.send('done')
// }

// const updateTour = (req,res)=>{
//     if(req.params.id*1>tours.length){
//         return res.status(404).json({
//             status : "Failed",
//             message: "Could not found this id"
//         })

//         }

//     res.status(200).json({
//         status: "Success",
//         message:"Updated successfully"

//     })
// }

// const deleteTour = (req,res)=>{
//     if(req.params.id*1>tours.length){
//         return res.status(404).json({
//             status : "Failed",
//             message: "Could not found this id"
//         })
//         }
//     res.status(204).json({
//         status: "Success",
//         data:null

//     })
// }

// app.get('/api/v1/tours',getAllTours);
// app.get('/api/v1/tours/:id',getParticularTour);
// app.post('/api/v1/tours',addNewTour);
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour)

////////////////////////   ROUTES   //////////////////////////////////



// app.route('/api/v1/tours').get(getAllTours).post(addNewTour);
// app.route('/api/v1/tours/:id').get(getParticularTour).patch(updateTour).delete(deleteTour);

// app.route('/api/v1/users').get(getAllUsers).post(addNewUser);
// app.route('/api/v1/tours/:id').get(getParticularUser).patch(updateUser).delete(deleteUser);

// More convenient way for future reference to get seperated in folders
// const tourRouter = express.Router();
// const userRouter = express.Router();

// tourRouter.route('/').get(getAllTours).post(addNewTour);
// tourRouter.route('/:id').get(getParticularTour).patch(updateTour).delete(deleteTour);

// userRouter.route('/').get(getAllUsers).post(addNewUser);
// userRouter.route('/:id').get(getParticularUser).patch(updateUser).delete(deleteUser);

// app.use('/api/v1/tours',tourRouter)
// app.use('/api/v1/users',userRouter)

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);

// app.all('*',(req,res,next)=>{                            // this middleware get called after getting any url other than one which is accepted by the above 2   agr upper 2 se phle lga dete toh hmesha yhi chlta
// res.status(404).json({
//     status:'fail',
//     message:`Can't find ${req.originalUrl} on this server!`
// });

// const err = new Error (`Can't find ${req.originalUrl} on this server!`);
// err.status = 'fail';
// err.statusCode = 404;

// next(err)    //to directly jump to the err middleware skipping the in between all middlewares
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

////////////////////////   SERVER  //////////////////////////////////

module.exports = app;
