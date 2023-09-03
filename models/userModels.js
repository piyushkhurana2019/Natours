const crypto = require('crypto'); 
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { schema } = require('./tourModels');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please tell us your name']
    },
    email:{
        type: String,
        required: [true,'Please tell us your email'],
        unique: [true,'email should be unique'],
        lowerCase: [true,'all letterd in the email should be lower'],
        validate: [validator.isEmail,'please provide a valid email']
    },

    photo: String,
    
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },



    password:{
        type: String,
        required: [true,'please provode a password'],
        minLength: 8,
        select: false // by doing this it will automatically not shown up in any output
    },

    passwordConfirm:{
        type: String,
        required:[true,'please confirm your password'],
        validate:{
            // this will only work on CREATE and SAVE
            validator: function(el){
                return el === this.password;
            },
            message:"password should be same!"
        }
    },
    passwordChangedAt:{
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date ,

    active:{
        type: Boolean,
        default: true,
        select: false
    }

})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    // Hash the password with CPU cost 12
    this.password = await bcrypt.hash(this.password, 12);

    //DELETE the passwordConfirm field as we only need password field in our DB
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password')||this.isNew) return next() ;

    this.passwordChangedAt = Date.now() -1000;
    next()
});

userSchema.pre(/^find/, function(next){     // all queries starting with find i.e find, findByIdAnd.. 
    this.find({active: {$ne: false}});
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    // we cannot use this.Pasword as candidate password here bcz password is not there in output as select: false
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if(this.passwordChangedAt)
    {   const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < changedTimeStamp;
    }

    // False means not changed
    return false; 
};

userSchema.methods.createPasswordResetToken =function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

   console.log({resetToken}, this.passwordResetToken);

   this.passwordResetExpires = Date.now() + 10*60*1000

   return resetToken
}

const User = mongoose.model('User',userSchema);

module.exports = User;