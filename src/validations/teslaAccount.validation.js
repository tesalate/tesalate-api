const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTeslaAccount = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    access_token: Joi.string(),
    refresh_token: Joi.string(),
    linked: Joi.boolean(),
  }),
};

const getTeslaAccounts = {
  query: Joi.object().keys({
    email: Joi.string().email(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTeslaAccount = {
  params: Joi.object().keys({
    teslaAccountId: Joi.string().custom(objectId),
  }),
};

const updateTeslaAccount = {
  params: Joi.object().keys({
    teslaAccountId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().required().email(),
      access_token: Joi.string(),
      refresh_token: Joi.string(),
      linked: Joi.boolean(),
    })
    .min(1),
};

const deleteTeslaAccount = {
  params: Joi.object().keys({
    teslaAccountId: Joi.string().custom(objectId),
  }),
};

const linkTeslaAccount = {
  body: Joi.object()
    .keys({
      email: Joi.string().required().email(),
      refreshToken: Joi.string().required(),
    })
    .min(1),
};

const unlinkTeslaAccount = {};

module.exports = {
  linkTeslaAccount,
  unlinkTeslaAccount,
  createTeslaAccount,
  getTeslaAccounts,
  getTeslaAccount,
  updateTeslaAccount,
  deleteTeslaAccount,
};
