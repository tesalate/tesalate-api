const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getMapPoints = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),

    vehicle: Joi.string().custom(objectId),
    latLongString: Joi.string(),
    visitCount: Joi.number().integer(),
  }),
};

const getMapPointsByDistanceApart = {
  params: {
    vehicle: Joi.string().custom(objectId).required(),
  },
  query: Joi.object().keys({
    km: Joi.number(),
  }),
};

const getMapPoint = {
  params: Joi.object().keys({
    mapPointId: Joi.string().custom(objectId).required(),
  }),
};

const deleteMapPoint = {
  params: Joi.object().keys({
    mapPointId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getMapPoints,
  getMapPointsByDistanceApart,
  getMapPoint,
  deleteMapPoint,
};
