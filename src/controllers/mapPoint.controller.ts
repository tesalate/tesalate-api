import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { mapPointService } from '../services';
import pick from '../utils/pick';


const getMapPoints = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['vehicle', 'latLongString', 'visitCount']),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mapPointService.queryMapPoints(filter, options);
  res.send(result);
});

const getMapPointsByDistanceApart = catchAsync(async (req, res) => {
  const result = await mapPointService.getMapPointsByDistanceApart(req.query.km, req.params.vehicle as string, req.user._id);
  res.send(result);
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
