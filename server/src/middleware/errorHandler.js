function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong on our end.";

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
