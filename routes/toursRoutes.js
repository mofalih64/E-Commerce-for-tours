const express = require('express');
const tourController = require('./../Controllers/tourController');
const authController = require('./../Controllers/authControler');
const reviewRouter = require('./../routes/reviewRoutes');
const tourRouter = express.Router();
// tourRouter.param('id', tourController.checkId);

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

  tourRouter.route('/tours-within/:distance/center/:lating/unit/:unit')
  .get(tourController.getToursWithin)

tourRouter.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTop, tourController.getalltours);
tourRouter
  .route('/:id')
  .get(tourController.gettour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updatetour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
tourRouter
  .route('/')
  .get(tourController.getalltours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.addtour
  );

// tourRoutes
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = tourRouter;
