const express = require('express');
const usersController = require('./../Controllers/userController');
const authController = require('./../Controllers/authControler');

const userRouter = express.Router();

userRouter.post('/signin', authController.signIn);
userRouter.post('/signup', authController.signUp);
userRouter.post('/forgopassword', authController.forgotPassword);
userRouter.patch('/resetPssword/:token', authController.resetPassword);

userRouter.use(authController.protect);

userRouter.get('/me', usersController.getMe, usersController.getUser);
userRouter.patch('/updateMyPassword', authController.updatePassword);
userRouter.patch('/updateMe', usersController.updateMe);
userRouter.delete('/deleteMe', usersController.deleteMe);

userRouter.use(authController.restrictTo('admin'));
userRouter
  .route('/')
  .post(usersController.addUser)
  .get(usersController.getAllUsers);

userRouter
  .route('/:id')
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)
  .get(usersController.getUser);

module.exports = userRouter;
