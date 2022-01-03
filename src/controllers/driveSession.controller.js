const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { driveSessionService } = require('../services');
const pick = require('../utils/pick');

const getDriveSessions = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, [
      'vehicle',
      'startDate',
      'endDate',
      'maxSpeed',
      'maxPower',
      'maxRegen',
      'distance',
      'startLocation',
      'endLocation',
      'flags',
    ]),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await driveSessionService.queryDriveSessions(filter, options);
  res.send(result);
});

const getDriveSession = catchAsync(async (req, res) => {
  const driveSession = await driveSessionService.getDriveSessionAggregateById(req.params.driveSessionId, req.user._id);
  if (!driveSession) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Drive session not found');
  }
  res.send(driveSession);
});

const deleteDriveSession = catchAsync(async (req, res) => {
  await driveSessionService.deleteDriveSessionById(req.params.driveSessionId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getDriveSessions,
  getDriveSession,
  deleteDriveSession,
};
