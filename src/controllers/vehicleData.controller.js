const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { vehicleDataService } = require('../services');
const pick = require('../utils/pick');

const getVehicleDataPoints = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['vin', 'vehicle_id', 'id_s', 'display_name', 'state', 'vehicle']),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await vehicleDataService.queryVehicleDataPoints(filter, options);
  res.send(result);
});

const getVehicleDataPoint = catchAsync(async (req, res) => {
  const vehicle = await vehicleDataService.getVehicleDataPointById(req.params.vehicleDataId, req.user._id);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  res.send(vehicle);
});

const deleteVehicleDataPoint = catchAsync(async (req, res) => {
  await vehicleDataService.deleteVehicleDataPointById(req.params.vehicleDataId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getVehicleDataPoints,
  getVehicleDataPoint,
  deleteVehicleDataPoint,
};
