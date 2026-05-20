const { ClientError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    convert: false,
  });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return next(new ClientError(messages, 400));
  }
  req.body = value;
  next();
};

module.exports = validate;