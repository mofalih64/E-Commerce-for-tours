const express = require('express');
const reviewController = require('./../Controllers/reviewContrloer');
const authControler = require('./../Controllers/authControler');

const router = express.Router({ mergeParams: true });

router.use(authControler.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authControler.restrictTo('user'),
    reviewController.setUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authControler.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authControler.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
