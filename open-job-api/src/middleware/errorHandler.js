const { ClientError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
  status: 'failed',
  message: err.message,
});
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'fail',
      message: 'File size too large',
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

module.exports = errorHandler;