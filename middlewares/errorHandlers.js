// errorHandlers.js

const errorHandler = (err, req, res, next) => {
  // status code
  let statusCode = res.statusCode ? res.statusCode : 500;

  if (statusCode == 200) {
    statusCode = 400;
  }

  // error message
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  // error response
  res.status(statusCode).json({
    message: message,
    status: statusCode,
    stack: err.stack,
  });
};

// export error handler function
module.exports = errorHandler;





