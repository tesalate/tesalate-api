const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getVehicleDataPoints = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),

    vin: Joi.string(),
    vehicle: Joi.string(),
    vehicle_id: Joi.number(),
    id_s: Joi.string(),
    display_name: Joi.string(),
    state: Joi.string(),
  }),
};

const getVehicleDataPoint = {
  params: Joi.object().keys({
    vehicleDataId: Joi.string().custom(objectId),
  }),
};

const deleteVehicleDataPoint = {
  params: Joi.object().keys({
    vehicleDataId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getVehicleDataPoints,
  getVehicleDataPoint,
  deleteVehicleDataPoint,
};
