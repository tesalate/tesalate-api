const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { vehicleService } = require('../services');
const pick = require('../utils/pick');

const createVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body, req.user.id, req.user.teslaAccount);
  res.status(httpStatus.CREATED).send(vehicle);
});

const getVehicles = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, [
      '_id',
      'vin',
      'access_type',
      'teslaAccount',
      'vehicle_id',
      'id_s',
      'tokens',
      'id',
      'display_name',
      'option_codes',
      'color',
      'state',
      'in_service',
      'calendar_enabled',
      'api_version',
      'backseat_token',
      'backseat_token_updated_at',
    ]),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await vehicleService.queryVehicles(filter, options);
  res.send(result);
});

const getVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.vehicleId, req.user._id);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  res.send(vehicle);
});

const updateVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.updateVehicleById(req.params.vehicleId, req.body, req.user._id);
  res.send(vehicle);
});

const deleteVehicle = catchAsync(async (req, res) => {
  await vehicleService.deleteVehicleById(req.params.vehicleId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
