//FAT MODELS               As much business logic as can be possible as it is linked to behind the scenes

const slugify = require('slugify');
const mongoose = require('mongoose');
const validator = require('validator');
// const User = require('./userModels'); 
const { promises } = require('nodemailer/lib/xoauth2');
//creating mongoose schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "The name of the tour is required"],     //2nd argument in the array is the error statement         //it is a validator
        unique: true,     //it is not a validator
        trim: true,
        maxlength: [40,'A tour name cannot be more than 40 words'], 
        minlength: [1,'A tour name must be of atleast 10 words'], 
        //the above 2 validators will also works with update route also as there we set runValidators: true

        //using npm library of validators
        // validate: [validator.isAlpha, 'Tour Can Only contains alphabets']
    },
    slug:String,
    secretTour: {
        type: Boolean,
        default: false
    },
    ratingsAverage:{
        type: Number,
        default: 4.5,
        min:[0,'ratings must be more than 0'],          //can also work with dates
        max:[5,'ratings can be max 5']                  //can also work with dates
    },
    ratingsQuantity:{
        type: Number,
        default: 0
      
    },
    price:{
        type: Number,
        required: [true, "The price of the tour should be defined"]
    },
    difficulty:{
        type: String,
        required:[true, 'It should have a difficulty level'],
        enum:{                                                  //only for strings, dont try for numbers
            values:['easy', 'medium', 'difficult'],           //only these values are allowed
            message:'Difficulty can be only easy, medium, difficult'
        }
    },
    duration:{
        type: Number,
        required: [true, 'Duration is required']
    },
    maxGroupSize:{
        type: Number,
        required:[true, 'A tour must have a maximum group size']
    },
    priceDiscount: {
        type: Number,

        // Makinng our Own Custom Validator
        validate:{
            validator: function(val){           //the discountPrice will come in val
            //this only points to current doc on NEW doc creation nd not on update just like doc middleware
                return val<this.price           //if val<actual price return true
            },
            message: 'discounted price ({VALUE}) must be smaller than the actual price' //{VALUE} iski jgah actual value replace ho jayegi this is the feature of mongoose and not of JS  
        }
    },
    summary:{
        type: String,
        trim: true,       //it removes the white spaces from the beg and the end of the string
        required: [true, 'A tour must have a summary']
    },

    description:{
        type: String,
        trim: true
    },

    imageCover:{
        type: String,
        required: [true, 'A tour must have a cover image']
    },

    images: [String],
        
    createdAt: {
            type: Date,
            default: Date.now(),
            select: false              //to hide this created at info in the output
        },

    startDates: [Date],

    startLocation: {
        // GeoJSON :- Geospatial json format
        //Atleast 2 hone jruri h in this case type and coord
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },

        coordinates:[Number],  // in mongoose 1st is longituse and 2nd is lattitude, in rest like google maps it is opposite
        address:String,
        description:String
    },
    locations:[
        {
            type: {
            type: String,
            default:'Point',
            enum:['Point']
    },
    
        coordinates:[Number],
        address:String,
        description: String,
        day:Number
}
],

guides: 
// Array            // simple Array likhte toh direct reference mil jata that means child referencong ab aise type likhke and reference daalke likh rhe h toh populate krna pdega nhi toh sirf id hi show hoyegi output m
[
    {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
],

// reviews:[
//     {
//         type: mongoose.Schema.ObjectId,
//         ref:'Review'
// }
// ]         // this is one of the way in which we can get reviews in tours, now we populate this array of reviews id to get reviews

// But a short method of doing this is to use virtual populate.

},

{
    toJSON:{ virtuals:true},         //jb jb data json ki form m output hoga tb tb virtuals true ho jayega so that the virtuals will also be the part of output virtuals mtlb aisi value jo direct db m nhi h but kisi trah se calculate ki gyi hai
    toObject:{ virtuals:true}        //to actually show/see the schema in object format
});


//Setting ids to make searching fo a particular filter easy for mongo as isko saare items search nhi krne pdenge direct ussi index p jaake fetch krlega, one imp thing:- how to decide that which field should get indexed or not:- which is most likely to be searched by the user and which will be least written(update) in future  or agr ek field p phle code m index daal diya and then vo code comment krdiya ya htaa diya toh index abhi bhi db m lga hi hoga vaha se spl jaake htana pdgea
tourSchema.index({price: 1, ratingsAverage:-1});  // simply 1 for ascending and -1 for descending
tourSchema.index({slug: 1});  


//creating virtual object means something jisko hm alag se DB m store nhi krna chahte like kilometers and meters as they can be derived from on another

tourSchema.virtual('durationWeeks').get(function(){      //we use nrml function here and not the arrow as we are require to use this. here which is not suppported by arrow fun
    return this.duration/7;

    //IMPORTANT we cannot use queries like Tour.find(where durationWeeks =1) as durationWeeks is not the part of DB 
})

// VIRTUAL POPULATE
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',// this is the name of the field in the other model, where the reference of the current model is stored in order to connect these 2 model
    localField:'_id'             // where the id of the current model is stored here in this current tour model 

    //_id is called in the local model is called tour in the foreign model under review model 
})

//DOCUMENT MIDDLEWARE that runs just before the .save(), .create()   note:- will not run for insertMany document middleware hota hi sirf save cmnd k saath use krne k liye hai
tourSchema.pre('save', function(next){       //There are 2 types of middleware pre and post pre meanns phle run krega post means baad m      here it is alled a pre save hook, hook is save here  
    // console.log(this)     // wil show the recently saved/created document in the DB
    this.slug=slugify(this.name, {lower:true});            //ye this ude ho rha hai current doc k liye
    next();
});

// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id=> await User.findById(id))
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

// tourSchema.pre('save',function(next){       //just to show there can be 2 pre middleware at the same time, 
//     console.log(this);                      // middleware itself gives access to the this keyword that refers to the most recent one                   
// next();
// });

// tourSchema.post('save',function(doc,next){     //doc isiliye bcz bnne k baad ye call hoyega toh bna hua document doc variable m save hoga
//     console.log(doc);
//     next();
// })


//Query Middleware              allows us to run fun before or after a certain query is executed 

// tourSchema.pre('find',function(next){               //find hook isko querry middleware bnata h
tourSchema.pre(/^find/,function(next){               //un sbhi methods k liy echlega jinke nam em phle find aata ho like find one findOneAndDelete findOneAndUpdate, etc hm sbke liye diff bhi likh skte the but this regular exp is one stop solution
    this.find({secretTour: {$ne: true}});         //simply shows those whose secretTour is false
    this.start = Date.now();                       // ye this. use ho rha hai current querry k liye
    next();
});

tourSchema.pre(/^find/,function(next){
    this.populate({
        path : 'guides',
        select: '-__v'});

        next();
});

tourSchema.post(/^find/,function(docs, next){

    console.log(`Query took ${Date.now() - this.start} milliseconds`);     //just to find the time lapse between the doc bnne k phle vala time and kitne der m bn k complete hua vala time
    // console.log(docs);
    next();
})

//AGGREGATION MIDDLEWARE              jo hum secretTour hide krna chah rhe h vo aggregation m stats nikalte time nhi ho rha therefore ya toh hm hrr aggregation pipeline m jaake secretTour: true valo ko exclude krein ya fr simply sbke liye ek middleware chla le

tourSchema.pre('aggregate',function(next){

    this.pipeline().unshift({ $match: {secretTour: {$ne: true}}});        //unshift aggregation array m 1st p kuch push krna ho toh 

    console.log(this.pipeline());                 // here this. use ho rha hai current aggregate object k liye
    next();
})




//creating mongoose model that is used for CRUD operations
const Tour = mongoose.model('Tour', tourSchema)     // Notation:- First alphabet should be capital
module.exports = Tour;