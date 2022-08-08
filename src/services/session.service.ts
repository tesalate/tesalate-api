import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Session } from '../models';
import { SessionType } from '../models/session.model';
import ApiError from '../utils/ApiError';
import { chargeSessionAggregate, driveSessionAggregate } from './aggregates';

/**
 * Query for  sessions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySessions = async (filter, options) => {
  const sessions = await Session.paginate(filter, options);
  return sessions;
};

const getSessions = async (query, user) => {
  const { page = 1, limit, vehicle, type, sortBy = 'startDate:desc' } = query;
  const facetData: any = [
    { $unset: ['sessionData', 'dataPoints', 'endLocation', 'user', 'vehicle', '__v', 'type'] },
    {
      $skip: limit * (page <= 1 ? 0 : page - 1),
    },
  ];
  if (limit > 0) facetData.push({ $limit: limit });
  const [sessions] = await Session.aggregate([
    {
      $match: {
        vehicle: new mongoose.Types.ObjectId(vehicle),
        user: new mongoose.Types.ObjectId(user),
        type,
      },
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$sessionData'] } },
    },
    {
      $sort: {
        ...sortBy.split(',').reduce(
          (acc: Record<string, number>, curr: string) => ({
            ...acc,
            [curr.split(':')[0]]: curr.split(':')[1] === 'desc' ? -1 : 1,
          }),
          {}
        ),
      },
    },
    {
      $facet: {
        metadata: [
          {
            $count: 'totalResults',
          },
          {
            $addFields: {
              page,
              limit,
              totalPages: {
                $ceil: {
                  $divide: ['$totalResults', limit || 1],
                },
              },
            },
          },
        ],
        data: facetData,
      },
    },
    {
      $project: {
        results: '$data',
        page: {
          $first: '$metadata.page',
        },
        limit: {
          $first: '$metadata.limit',
        },
        totalPages: {
          $first: '$metadata.totalPages',
        },
        totalResults: {
          $first: '$metadata.totalResults',
        },
      },
    },
  ]);
  return sessions;
};

const getSessionLogs = async (query, user) => {
  const { startDate, endDate, vehicle } = query;
  const logs = await Session.aggregate([
    {
      $match: {
        vehicle: new mongoose.Types.ObjectId(vehicle),
        user: new mongoose.Types.ObjectId(user),
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $project: {
        data: [
          {
            type: '$type',
            date: '$createdAt',
            start: true,
          },
          {
            type: '$type',
            date: '$updatedAt',
            start: false,
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$data',
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              _id: '$_id',
            },
            '$data',
          ],
        },
      },
    },
    {
      $sort: {
        date: -1,
      },
    },
  ]);
  return logs;
};

/**
 * Get  session by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<Session>}
 */
const getSessionById = async (_id, user) => {
  return Session.findOne({ _id, user });
};

const getSessionAggregateById = async (_id, user, type) => {
  let session;
  switch (type) {
    case SessionType['charge']:
      [session] = await Session.aggregate(chargeSessionAggregate(_id, user));
      break;
    case SessionType['drive']:
      [session] = await Session.aggregate(driveSessionAggregate(_id, user));
      break;
    default:
      break;
  }
  return session;
};

/**
/**
 * Get  session by user id
 * @param {string} user
 * @returns {Promise<Session>}
 */
const getSessionsByUserId = async (user) => {
  return Session.find({ user });
};

/**
 * Delete  session by id
 * @param {ObjectId} SessionPointId
 * @param {ObjectId} user
 * @returns {Promise<Session>}
 */
const deleteSessionById = async (SessionPointId, user) => {
  const Session = await getSessionById(SessionPointId, user);
  if (!Session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  await Session.remove();
  return Session;
};

export default {
  querySessions,
  getSessions,
  getSessionLogs,
  getSessionById,
  getSessionsByUserId,
  deleteSessionById,
  getSessionAggregateById,
};
