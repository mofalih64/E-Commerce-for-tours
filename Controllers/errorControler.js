const AppError = require('./../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateBD = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*\1/)[0];
  const message = `Duplicated field value: ${value}. please use another value `;
  return new AppError(meesage, 400);
};
const handleJwtError = () => {
  return new AppError('invalid token, please log in', 401);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join(' .')}`;
  return new AppError(meesage, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const handdleExpiredError = () => {
  new AppError('the token is expired log in again', 401);
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Errorrrr!!!!!!!!', err);
    res.status(500).json({
      status: 'error',
      message: 'somthing went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == 'poroduction') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateBD(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiresError') error = handdleExpiredError();
    sendErrorProd(error, res);
  }
};
