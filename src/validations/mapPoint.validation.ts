import Joi from 'joi';
import { objectId } from './custom.validation';

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
  query: Joi.object().keys({
    vehicle: Joi.string().custom(objectId).required(),
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

export default {
  getMapPoints,
  getMapPointsByDistanceApart,
  getMapPoint,
  deleteMapPoint,
};
