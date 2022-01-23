import Joi from 'joi';
import { objectId } from './custom.validation';

const getChargeSessions = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),

    vehicle: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    maxChargeRate: Joi.number(),
    energyAdded: Joi.number(),
    charger: Joi.string().custom(objectId),
    geoJSON: Joi.string(),
    flags: Joi.string(),
  }),
};

const getChargeSession = {
  params: Joi.object().keys({
    chargeSessionId: Joi.string().custom(objectId).required(),
  }),
};

const deleteChargeSession = {
  params: Joi.object().keys({
    chargeSessionId: Joi.string().custom(objectId).required(),
  }),
};

export default {
  getChargeSessions,
  getChargeSession,
  deleteChargeSession,
};
