const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { chargeSessionService } = require('../services');
const pick = require('../utils/pick');

const getChargeSessions = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['vehicle', 'startDate', 'endDate', 'maxChargeRate', 'energyAdded', 'charger', 'geoJSON', 'flags']),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await chargeSessionService.queryChargeSessions(filter, options);
  res.send(result);
});

const getChargeSession = catchAsync(async (req, res) => {
  const chargeSession = await chargeSessionService.getChargeSessionAggregateById(req.params.chargeSessionId, req.user._id);
  if (!chargeSession) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Charge session not found');
  }
  res.send(chargeSession);
});

const deleteChargeSession = catchAsync(async (req, res) => {
  await chargeSessionService.deleteChargeSessionById(req.params.chargeSessionId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getChargeSessions,
  getChargeSession,
  deleteChargeSession,
};
