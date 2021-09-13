const crypto=require('crypto');
const { promisify } = require('util');
const JWT = require('jsonwebtoken');
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/AppError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken=(user,statusCode,res)=>{
  
  const token = signToken(user._id);
const cookieOptions={
  expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
  httpOnly:true
};
if(process.env.NODE_ENV==='production'){
  cookieOptions.secure=true
}
  res.cookie('jwt',token,cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    next();
  });
 
  createSendToken(newUser,201,res);

});
exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return nexr(new appError('please insert email amd password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new appError('incorrect email or password', 401));
  }
  createSendToken(user,200,res);

});
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new appError('YOU ARE NOT LOGED IN!! PLEASE LOG IN', 401));
  }
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new appError('the user belonging to this token do not exist', 401)
    );

  if (currentUser.changedPasswordAfter(decoded.iat)){
    return next(
      new appError('user recently changed  password! plese log in again ', 401)
    );
  }

  req.user = currentUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError('you dont have the permission to do tthis action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({email:req.body.email});
  if (!user) {
    return next(new appError('there is no user with this email', 404));
  }

  const restToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users//resetPassword/${restToken}`;

  const message = `forgot your password ? submit here your a request with your new pasword and confirm it to ${resetURL}
  ./n if you didn't forgot your password ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined,
      user.passwrodResetExpire = undefined;
      await user.save({validateBeforeSave:false})
      return next(appError('there was an errorsending the email, try again later',500)
)
  }
});

exports.resetPassword=catchAsync( async (req,res,next)=>{
const hashToken=crypto.createHash('sha256').update(req.params.token).digest('hex');

const user= await User.findOne({createPasswordResetToken:hashToken,passwrodResetExpire:{$gt:DataCue.now()}});

if(!user){
  return next(new appError('invalid token or has expired',400))
}

user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.createPasswordResetToken=undefined;
user.passwrodResetExpire=undefined;
await user.save();
createSendToken(user,200,res);

});

exports.updatePassword=catchAsync( async(req,res,next)=>{
  const user = await User.findById(req.user.id).select('+passwords');

  if (!(await user.correctPassword(req.body.passwordCurrent,user.password))) {
    return next(new appError('the password you sent is wrong', 401));
  }

  
  user.password=req.body.newPaswoord;
  user.passwordConfirm=req.body.passwordConfirm;
  await user.save();

  createSendToken(user,200,res);

});
