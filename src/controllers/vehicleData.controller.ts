import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { vehicleDataService } from '../services';
import pick from 'lodash/pick';
import client from '../redis';
import config from '../config/config';

const getVehicleDataPoints = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['vin', 'vehicle_id', 'id_s', 'display_name', 'state', 'vehicle']),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page', 'select']);

  const redisKey = JSON.stringify({ ...filter, ...options });

  const cachesDataPoint = await client.get(redisKey);
  if (cachesDataPoint != null) {
    res.setHeader('x-cache', 'cached');
    return res.send(JSON.parse(cachesDataPoint));
  } else {
    const result = await vehicleDataService.queryVehicleDataPoints(filter, options);
    await client.setex(redisKey, config.cache.latestTTL, JSON.stringify(result));
    res.setHeader('x-cache', 'no-cache');
    res.send(result);
  }
});

const getVehicleDataPoint = catchAsync(async (req, res) => {
  const redisKey = JSON.stringify({ params: req.params, user: req.user._id });

  const cachesDataPoint = await client.get(redisKey);
  if (cachesDataPoint != null) {
    res.setHeader('x-cache', 'cached');
    return res.send(JSON.parse(cachesDataPoint));
  } else {
    const result = await vehicleDataService.getVehicleDataPointById(req.params.vehicleDataId, req.user._id);
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
    await client.setex(redisKey, 60 * 10, JSON.stringify(result));
    res.setHeader('x-cache', 'no-cache');
    res.send(result);
  }
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
