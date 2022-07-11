import catchAsync from '../utils/catchAsync';
import { statsService } from '../services';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

const getDriveStats = catchAsync(async (req, res) => {
  const results = await statsService.getDriveStats(req.query.vehicle, req.user._id);
  if (results.length < 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Drive stats not found');
  }
  res.send({ results, systemKey: 'driveStats', displayName: 'Miles Driven', displayOrder: 2, unit: 'miles' });
});

const getChargeStats = catchAsync(async (req, res) => {
  const results = await statsService.getChargeStats(req.query.vehicle, req.user._id);
  if (results.length < 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Charge stats not found');
  }
  res.send({ results, systemKey: 'chargeStats', displayName: 'Energy Added', displayOrder: 1, unit: 'kW' });
});

const getMapPointStats = catchAsync(async (req, res) => {
  const results = await statsService.getMapPointStats(req.query.vehicle, req.user._id);
  if (results.length < 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Map point stats not found');
  }
  res.send({ results, systemKey: 'mapPointStats', displayName: 'Map Points Added', displayOrder: 3, unit: 'points' });
});

export default {
  getDriveStats,
  getChargeStats,
  getMapPointStats,
};
