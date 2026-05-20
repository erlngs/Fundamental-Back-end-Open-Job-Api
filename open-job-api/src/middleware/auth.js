const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new AuthenticationError('Missing authentication token'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

module.exports = authMiddleware;