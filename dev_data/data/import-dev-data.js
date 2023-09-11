const fs = require('fs');
const mongoose = require('mongoose')
const dotenv = require('dotenv')                 
const Tour = require('./../../models/tourModels')
const Review = require('./../../models/reviewModel')
const User = require('./../../models/userModels')

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
// .connect(process.env.DATABASE_LOCAL,{
.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con =>{
    console.log("Db is succeccfully connected")
});

//Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

//Import Data
const importData = async () =>{
    try{
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log("Data added successfully")
    }catch(err){
        console.log(err);
    }
    process.exit();
}

//Delete all Data from DB
const deleteData = async()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data deleted')
    }  catch (err){
            console.log(err);
        }
        process.exit();
    }

    if(process.argv[2]==='--import')           //process.argv id the path like substance we give in console like --save during installing npm packages we specify it during the run command like node dev_data/data/import-dev-data --import/--delete
    {
        importData();
    }
    else if(process.argv[2]==='--delete')
    {
        deleteData();
    }
 