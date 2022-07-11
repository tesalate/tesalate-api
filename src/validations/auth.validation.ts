import Joi from 'joi';
import { password } from './custom.validation';

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    username: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    displayName: Joi.string(),
    inviteToken: Joi.any(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  cookies: Joi.object()
    .keys({
      token: Joi.string(),
      refreshToken: Joi.string().required(),
    })
    .pattern(/./, Joi.string()),
};

const refreshTokens = {
  cookies: Joi.object()
    .keys({
      token: Joi.string(),
      refreshToken: Joi.string().required(),
    })
    .pattern(/./, Joi.string()),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
