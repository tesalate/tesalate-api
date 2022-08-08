import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { sessionService } from '../services';
import pick from 'lodash/pick';

// const getSessions = catchAsync(async (req, res) => {
//   const filter = {
//     ...pick(req.query, ['vehicle', 'flags', 'type', 'createdAt', 'updatedAt']),
//     user: req.user._id,
//   };

//   const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
//   const result = await sessionService.querySessions(filter, options);
//   res.send(result);
// });

const getSessions = catchAsync(async (req, res) => {
  const result = await sessionService.getSessions(req.query, req.user._id);
  res.send(result);
});

const getSession = catchAsync(async (req, res) => {
  const session = await sessionService.getSessionById(req.params.sessionId, req.user._id);
  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'session not found');
  }
  res.send(session);
});

const getSessionAggregateById = catchAsync(async (req, res) => {
  const result = await sessionService.getSessionAggregateById(req.params.sessionId, req.user._id, req.query.type);
  res.send({ result });
});

const getSessionLogs = catchAsync(async (req, res) => {
  const result = await sessionService.getSessionLogs(req.query, req.user._id);
  res.send({ result });
});

const deleteSession = catchAsync(async (req, res) => {
  await sessionService.deleteSessionById(req.params.sessionId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  getSessions,
  getSessionLogs,
  getSession,
  deleteSession,
  getSessionAggregateById,
};
