const fs = require('fs');
const mongoose = require('mongoose')
const dotenv = require('dotenv')                 
const Tour = require('./../../models/tourModels')

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

//Import Data
const importData = async () =>{
    try{
        await Tour.create(tours);
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
 