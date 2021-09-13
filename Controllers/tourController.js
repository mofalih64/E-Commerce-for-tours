const Tour = require('./../Models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/AppError');
const factory = require('./handelrsFactory');

exports.updatetour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.addtour = factory.createOne(Tour);
exports.gettour = factory.getOne(Tour, { path: 'reviews' });

exports.aliasTop = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getalltours = factory.getALL(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        //  _id: '$difficulty'
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'failed',
  //     message: err,
  //   });
  // }
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: 'startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

exports.getToursWithin=catchAsync(async(req,res,next)=>{
  const {distance,latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');

  const radius=unit==='mi'?distance/3963.2:distance/6378.1;

  if(!lng||!lat){
    next(new appError('please provide the latitutr and longitude in the format lat,lng',400));
  }
  const tours=await Tour.find(
    {startLocation:{$geoWithin:{$centerShpere:[[lng,lat],radius]}}})

  res.status(200).json({
    status:'success',
    results:tours.length,
    data:{
      data:tours
    }
  });
}
);

exports.getDistances=catchAsync(async (req,res,next)=>{
  const {latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
const multiplayer=unit==='mi'?0.000621371:0.001
  if(!lng||!lat){
    next(new appError('please provide the latitutr and longitude in the format lat,lng',400));
  }

  const distances= await Tour.aggregate([{
    $geoNear:{
      near:{
        type:'Point',
        coordinates:[lng*1,lat*1]
      },
      distanceField:'distance',
      distanceMultiplayer:multiplayer
    }
  },
{
$project:{
  distance:1,
  name:1
}
}
]);
s.status(200).json({
  status:'success',
 
  data:{
    data:distances
  }
});

})