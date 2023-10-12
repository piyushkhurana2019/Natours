const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),

    // Secure: true,    // cookie only travel through encrypted path i.e https
    httpOnly: true, // Browser can only send, recieve and store cookie not modify it
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // simply removes password field from output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // simply means const email = req.body.email, const password = req.body.pasword

  //1) Check if the email, password exist
  if (!email || !password) {
    return next(new AppError('please provide emailand passwrd', 400));
  }

  //Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password'); //this ({ email }) simply means ({email:email})
  //we need to explicitly select the password field as the output doesnt contain password and we need that to check

  // const correct = await user.correctPassword(password, user.password) // ye yhi p await ho jayega toh if vale m srf first user vali statement run hogi therefore to prevent this and made if to check botht he statements we will await this there
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); // 401 means unauthorized
  }

  //if everything ok, send token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting Token and check if its there ot not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt)
  token = req.cookies.jwt;
  // console.log(token);

  if (!token) {
    return next(new AppError('You are not logged In!'));
  }

  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //it is by default not a promise function but from the starting we are working with promises therefore we will make this fun as a promise by using a node module so that we can use async await functionality here as well
  // console.log(decoded);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );

  // 4) check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    // iat meand issued at
    return next(new AppError('user recently changed the password', 401));
  }

  // Grant acces to protected routes
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  //roles here is an array containing values passesd in by the time restrictTo is called i.e['admin','lead-guide']

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permissioin to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) GET user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generates the random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //hmne udhr sirf passwordResetExpire ko sirf set kiya tha save idhr ho rha hai
  // and validateBefreSave: false means jitne model define krte time validators h unko ignore kr do taaki bina kisi restriction k post req maar ske

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetpassword//${resetToken}`;

  const message = `Forgit your password? Submit a patch request eith your new passwordand password confirm to: ${resetURL}.\n If you didn't forgot your password, please ignore this mail!.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token.(Valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending email, please try again later',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.tokn)
    .digest('hex');

  const user = await user.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) if tpken has not expired, and there is user, et the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // 3) update changedPasswordAt property for the user

  //4) Log th euser in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) check if the posted current password is correct

  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log the user in, send JWT
  createSendToken(user, 200, res);
});
