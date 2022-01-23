import Joi from 'joi';
const { objectId } = require('./custom.validation');

const createVehicle = {
  body: Joi.object().keys({
    collectData: Joi.boolean(),
    vin: Joi.string().required(),
    access_type: Joi.string(),
    vehicle_id: Joi.number().required(),
    id_s: Joi.string().required(),
    tokens: Joi.array(),
    id: Joi.number(),
    display_name: Joi.string(),
    option_codes: Joi.string(),
    color: Joi.string(),
    state: Joi.string(),
    in_service: Joi.boolean(),
    calendar_enabled: Joi.boolean(),
    api_version: Joi.number(),
    backseat_token: Joi.any(),
    backseat_token_updated_at: Joi.any(),
  }),
};

const getVehicles = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    vin: Joi.string(),
    teslaAccount: Joi.string(),
    vehicle_id: Joi.number(),
    id_s: Joi.string(),
    access_type: Joi.string(),
    tokens: Joi.array(),
    id: Joi.number(),
    display_name: Joi.string(),
    option_codes: Joi.string(),
    color: Joi.string(),
    state: Joi.string(),
    in_service: Joi.boolean(),
    calendar_enabled: Joi.boolean(),
    api_version: Joi.number(),
    backseat_token: Joi.any(),
    backseat_token_updated_at: Joi.any(),
    collectData: Joi.boolean(),
  }),
};

const getVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId),
  }),
};

const updateVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      vin: Joi.string(),
      vehicle_id: Joi.number(),
      id_s: Joi.string(),
      tokens: Joi.array(),
      id: Joi.number(),
      access_type: Joi.string(),
      display_name: Joi.string(),
      option_codes: Joi.string(),
      color: Joi.string(),
      state: Joi.string(),
      in_service: Joi.boolean(),
      calendar_enabled: Joi.boolean(),
      api_version: Joi.number(),
      backseat_token: Joi.any(),
      backseat_token_updated_at: Joi.any(),
      collectData: Joi.boolean(),
    })
    .min(1),
};

const deleteVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId),
  }),
};

export default {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
