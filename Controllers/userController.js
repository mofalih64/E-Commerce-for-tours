const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/AppError');
const factory = require('./handelrsFactory');


exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError('this is not the suit place for chhanging the password', 400)
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators=true});
  res.status(200).json({
    stuatus: 'success',
    data:{
      user:updatedUser
    }
  });
};

exports.deleteMe=catchasync(async (req,res,next)=>{
await User.findByIdAndUpdate(req.user.id,{active:false})

res.status(204).json({
  status:'success',
  data:null
})
});

exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet defined/ please use signup istead',
  });
};
exports.deleteUser =factory.deleteOne(User);

exports.updateUser = factory.updateOne(User);

exports.getUser =factory.getOne(User)
 