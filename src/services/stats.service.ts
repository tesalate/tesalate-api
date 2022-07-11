import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ChargeSession, DriveSession, MapPoint } from '../models';
import ApiError from '../utils/ApiError';

/**
 * Aggregation of Drive Stats
 * @param {ObjectId} vehicle id
 * @param {ObjectId} user id
 * @returns {Promise<QueryResult>}
 */
const getDriveStats = async (vehicle, user) => {
  const data = await DriveSession.aggregate([
    {
      $match: {
        vehicle: mongoose.Types.ObjectId(vehicle),
        user: mongoose.Types.ObjectId(user),
      },
    },
    {
      $project: {
        day: {
          $dayOfMonth: {
            date: {
              $toDate: '$startDate',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        month: {
          $month: {
            date: {
              $toDate: '$startDate',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        year: {
          $year: {
            date: {
              $toDate: '$startDate',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        distance: '$distance',
      },
    },
    {
      $group: {
        _id: {
          day: '$day',
          month: '$month',
          year: '$year',
        },
        value: {
          $sum: '$distance',
        },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
      },
    },
  ]);
  return data;
};

/**
 * Aggregation of Charge Stats
 * @param {ObjectId} vehicle id
 * @param {ObjectId} user id
 * @returns {Promise<QueryResult>}
 */
const getChargeStats = async (vehicle, user) => {
  const data = await ChargeSession.aggregate([
    {
      $match: {
        vehicle: mongoose.Types.ObjectId(vehicle),
        user: mongoose.Types.ObjectId(user),
      },
    },
    {
      $project: {
        day: {
          $dayOfMonth: {
            date: {
              $toDate: '$startDate',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        month: {
          $month: {
            date: {
              $toDate: '$startDate',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        year: {
          $year: {
            date: {
              $toDate: '$startDate',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        energyAdded: '$energyAdded',
      },
    },
    {
      $group: {
        _id: {
          day: '$day',
          month: '$month',
          year: '$year',
        },
        value: {
          $sum: '$energyAdded',
        },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
      },
    },
  ]);
  return data;
};

/**
 * Aggregation of New Map Points
 * @param {ObjectId} vehicle id
 * @param {ObjectId} user id
 * @returns {Promise<QueryResult>}
 */
const getMapPointStats = async (vehicle, user) => {
  const data = await MapPoint.aggregate([
    {
      $match: {
        vehicle: mongoose.Types.ObjectId(vehicle),
        user: mongoose.Types.ObjectId(user),
      },
    },
    {
      $project: {
        day: {
          $dayOfMonth: {
            date: {
              $toDate: '$createdAt',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        month: {
          $month: {
            date: {
              $toDate: '$createdAt',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        year: {
          $year: {
            date: {
              $toDate: '$createdAt',
            },
            timezone: 'America/Los_Angeles',
          },
        },
        createdAt: '$createdAt',
      },
    },
    {
      $group: {
        _id: {
          day: '$day',
          month: '$month',
          year: '$year',
        },
        value: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
      },
    },
  ]);

  return data;
};

export default {
  getDriveStats,
  getChargeStats,
  getMapPointStats,
};
