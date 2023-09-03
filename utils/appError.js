class AppError extends Error {            // AppError naam ki class bnayi the taaki vo built in class Error ki functionality use kr ske isiliye usko extend kr diya

    constructor(message, statusCode){
        super(message);            // when we extends a parent class we call super inorder to call the parent constructor nd we do that with the only parameter message bca the message is the only parameter that built in error accepts

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ?'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);  //to show where the error hapens 
    }
}

module.exports = AppError


