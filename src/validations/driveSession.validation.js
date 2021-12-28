const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getDriveSessions = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),

    vid: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    maxSpeed: Joi.string(),
    maxPower: Joi.string(),
    maxRegen: Joi.string(),
    distance: Joi.string(),
    startLocation: Joi.string(),
    endLocation: Joi.string(),
    flags: Joi.string(),
  }),
};

const getDriveSession = {
  params: Joi.object().keys({
    driveSessionId: Joi.string().custom(objectId).required(),
  }),
};

const deleteDriveSession = {
  params: Joi.object().keys({
    driveSessionId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getDriveSessions,
  getDriveSession,
  deleteDriveSession,
};
