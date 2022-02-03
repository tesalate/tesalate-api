import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { chargeSessionService } from '../services';
import pick from 'lodash/pick';

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

export default {
  getChargeSessions,
  getChargeSession,
  deleteChargeSession,
};
