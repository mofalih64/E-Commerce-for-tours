const Review = require('./../Models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handelrsFactory');

exports.setUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getAllReviews = factory.getALL(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
