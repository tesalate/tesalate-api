import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { mapPointService } from '../services';
import pick from 'lodash/pick';
import client from '../redis';
import config from '../config/config';

const getMapPoints = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['vehicle', 'latLongString', 'visitCount']),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const redisKey = JSON.stringify({ ...filter, ...options });

  const cacheData = await client.get(redisKey);
  if (cacheData != null) {
    res.setHeader('x-cache', 'cached');
    return res.send(JSON.parse(cacheData));
  } else {
    const results = await mapPointService.queryMapPoints(filter, options);
    await client.setex(redisKey, config.cache.latestTTL, JSON.stringify(results));
    res.setHeader('x-cache', 'no-cache');
    res.send(results);
  }
});

const getMapPointsByDistanceApart = catchAsync(async (req, res) => {
  const redisKey = JSON.stringify({ km: req.query.km, vehicle: req.query.vehicle, user: req.user._id });
  const cachedData = await client.get(redisKey);
  const mostRecentDataPoint = await client.get(`${req.query.vehicle}:latest`);

  if (cachedData != null) {
    res.setHeader('x-cache', 'cached');
    return res.send(JSON.parse(cachedData));
  } else {
    const results = await mapPointService.getMapPointsByDistanceApart(
      req.query.km,
      req.query.vehicle as string,
      req.user._id,
      mostRecentDataPoint
    );
    await client.setex(redisKey, 30, JSON.stringify({ results }));
    res.setHeader('x-cache', 'no-cache');
    res.send({ results });
  }
});

const getMapPoint = catchAsync(async (req, res) => {
  const mapPoint = await mapPointService.getMapPointById(req.params.mapPointId, req.user._id);
  if (!mapPoint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Charge session not found');
  }
  res.send(mapPoint);
});

const deleteMapPoint = catchAsync(async (req, res) => {
  await mapPointService.deleteMapPointById(req.params.mapPointId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  getMapPoints,
  getMapPointsByDistanceApart,
  getMapPoint,
  deleteMapPoint,
};
