import Joi from 'joi';
import httpStatus from 'http-status';
import pick from 'lodash/pick';
import ApiError from '../utils/ApiError';

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body', 'cookies']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  next();
};

export default validate;
