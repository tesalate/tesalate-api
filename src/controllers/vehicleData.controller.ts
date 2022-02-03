import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { vehicleDataService } from '../services';
import pick from 'lodash/pick';

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

export default {
  getVehicleDataPoints,
  getVehicleDataPoint,
  deleteVehicleDataPoint,
};
