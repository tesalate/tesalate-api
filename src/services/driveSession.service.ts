import  httpStatus from 'http-status';
import  mongoose from 'mongoose';
import { DriveSession } from '../models';
import  ApiError from '../utils/ApiError';

/**
 * Query for drive sessions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDriveSessions = async (filter, options) => {
  const sessions = await DriveSession.paginate(filter, options);
  return sessions;
};

/**
 * Get drive session by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<DriveSession>}
 */
const getDriveSessionById = async (_id, user) => {
  return DriveSession.findOne({ _id, user });
};

/**
 * Get drive session data by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<DriveSession>}
 */
const getDriveSessionAggregateById = async (_id, user) => {
  const [driveSession] = await DriveSession.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(_id), user } },
    {
      $unwind: {
        path: '$dataPoints',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: 'vehicledata',
        let: { locator: '$dataPoints' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$locator'] } } },
          {
            $project: {
              _id: 1,
              'drive_state.power': 1,
              'drive_state.speed': 1,
              'drive_state.longitude': 1,
              'drive_state.latitude': 1,
              'drive_state.timestamp': 1,
              'drive_state.heading': 1,
              'charge_state.battery_level': 1,
              'charge_state.battery_range': 1,
              'vehicle_state.odometer': 1,
              'climate_state.outside_temp': 1,
              'climate_state.inside_temp': 1,
            },
          },
        ],
        as: 'populated',
      },
    },
    {
      $unwind: {
        path: '$populated',
        preserveNullAndEmptyArrays: false,
      },
    },
    { $sort: { 'populated.drive_state.timestamp': 1 } },
    {
      $group: {
        _id: '$_id',
        data: { $push: '$populated.drive_state' },
        startDate: { $first: '$startDate' },
        endDate: { $first: '$endDate' },
        batteryLevel: { $push: '$populated.charge_state.battery_level' },
        batteryRange: { $push: '$populated.charge_state.battery_range' },
        power: { $push: '$populated.drive_state.power' },
        speed: { $push: '$populated.drive_state.speed' },
        odometer: { $push: '$populated.vehicle_state.odometer' },
        labels: { $push: '$populated.drive_state.timestamp' },
        exTemp: { $push: '$populated.climate_state.outside_temp' },
        inTemp: { $push: '$populated.climate_state.inside_temp' },
        mapData: {
          $push: {
            vehicle: '$vehicle',
            dataPoints: [
              {
                _id: '$populated._id',
                drive_state: {
                  latitude: '$populated.drive_state.latitude',
                  longitude: '$populated.drive_state.longitude',
                  heading: '$populated.drive_state.heading',
                },
              },
            ],
          },
        },
      },
    },
    {
      $project: {
        mapData: '$mapData',
        graphData: {
          datasets: [
            // { label: 'battery level', data: '$batteryLevel' },
            { label: 'speed', data: '$speed' },
            { label: 'power', data: '$power' },
          ],
          labels: '$labels',
        },
        sessionData: {
          startDate: {
            value: { $arrayElemAt: ['$data.timestamp', 0] },
            displayName: 'start date',
            displayOrder: 1,
            unit: '',
            displayType: 'date',
          },
          endDate: {
            value: { $arrayElemAt: ['$data.timestamp', -1] },
            displayName: 'end date',
            displayOrder: 1,
            unit: '',
            displayType: 'date',
          },
          distance: {
            value: { $trunc: [{ $subtract: [{ $arrayElemAt: ['$odometer', -1] }, { $arrayElemAt: ['$odometer', 0] }] }, 2] },
            displayName: 'distance',
            displayOrder: 2,
            unit: ' miles',
            displayType: '',
          },
          maxSpeed: {
            value: { $max: '$data.speed' },
            displayName: 'max speed',
            displayOrder: 3,
            unit: ' mph',
            displayType: '',
          },
          avgSpeed: {
            value: { $trunc: [{ $avg: '$data.speed' }, 2] },
            displayName: 'avg. speed',
            displayOrder: 4,
            unit: ' mph',
            displayType: '',
          },
          maxPower: {
            value: { $max: '$data.power' },
            displayName: 'max power',
            displayOrder: 5,
            unit: ' kW',
            displayType: '',
          },
          avgPower: {
            value: { $trunc: [{ $avg: '$data.power' }, 2] },
            displayName: 'avg. power',
            displayOrder: 6,
            unit: ' kW',
            displayType: '',
          },
          maxRegen: {
            value: { $min: '$data.power' },
            displayName: 'max regen',
            displayOrder: 7,
            unit: ' kW',
            displayType: '',
          },
          efficiency: {
            value: {
              $cond: {
                if: {
                  $or: [
                    { $eq: [{ $subtract: [{ $arrayElemAt: ['$odometer', -1] }, { $arrayElemAt: ['$odometer', 0] }] }, 0] },
                    {
                      $eq: [
                        { $subtract: [{ $arrayElemAt: ['$batteryRange', 0] }, { $arrayElemAt: ['$batteryRange', -1] }] },
                        0,
                      ],
                    },
                  ],
                },
                then: 0,
                else: {
                  $trunc: [
                    {
                      $divide: [
                        241.9,
                        {
                          $divide: [
                            { $subtract: [{ $arrayElemAt: ['$odometer', -1] }, { $arrayElemAt: ['$odometer', 0] }] },
                            { $subtract: [{ $arrayElemAt: ['$batteryRange', 0] }, { $arrayElemAt: ['$batteryRange', -1] }] },
                          ],
                        },
                      ],
                    },
                    2,
                  ],
                },
              },
            },
            displayName: 'efficiency',
            displayOrder: 9,
            unit: ' Wh/mi',
            displayType: '',
          },
          fromTo: {
            value: {
              $concat: [
                { $toString: { $arrayElemAt: ['$batteryLevel', 0] } },
                '% -> ',
                { $toString: { $arrayElemAt: ['$batteryLevel', -1] } },
              ],
            },
            displayName: 'from -> to',
            displayOrder: 10,
            unit: '%',
            displayType: '',
          },
          avgExTemp: {
            value: { $trunc: [{ $avg: '$exTemp' }, 0] },
            displayName: 'avg. ext. temp',
            displayOrder: 11,
            unit: '°',
            displayType: 'degrees',
          },
          avgInTemp: {
            value: { $trunc: [{ $avg: '$inTemp' }, 0] },
            displayName: 'avg. int. temp',
            displayOrder: 12,
            unit: '°',
            displayType: 'degrees',
          },
          duration: {
            value: { $subtract: [{ $arrayElemAt: ['$data.timestamp', -1] }, { $arrayElemAt: ['$data.timestamp', 0] }] },
            displayName: 'duration',
            displayOrder: 8,
            unit: '',
            displayType: 'duration',
          },
          estTimeWaiting: {
            value: {
              $cond: [
                { $gt: [{ $size: '$data.speed' }, 2] },
                {
                  $multiply: [
                    {
                      $reduce: {
                        input: '$data.speed',
                        initialValue: 0,
                        in: {
                          $add: [
                            0,
                            {
                              $size: {
                                $filter: {
                                  input: {
                                    $slice: ['$data.speed', 1, { $subtract: [{ $size: '$data.speed' }, 2] }],
                                  },
                                  as: 'speed',
                                  cond: {
                                    $lte: ['$$speed', 0],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    10000,
                  ],
                },
                0,
              ],
            },
            displayName: 'est. time stopped',
            displayOrder: 12,
            unit: '',
            displayType: 'duration',
          },
        },
      },
    },
  ]);
  return driveSession;
};

/**
 * Get drive session by user id
 * @param {string} user
 * @returns {Promise<DriveSession>}
 */
const getDriveSessionByUserId = async (user) => {
  return DriveSession.find({ user });
};

/**
 * Delete drive session by id
 * @param {ObjectId} driveSessionPointId
 * @param {ObjectId} user
 * @returns {Promise<DriveSession>}
 */
const deleteDriveSessionById = async (driveSessionPointId, user) => {
  const driveSession = await getDriveSessionById(driveSessionPointId, user);
  if (!driveSession) {
    throw new ApiError(httpStatus.NOT_FOUND, 'DriveSession not found');
  }
  await driveSession.remove();
  return driveSession;
};

export default {
  queryDriveSessions,
  getDriveSessionById,
  getDriveSessionAggregateById,
  getDriveSessionByUserId,
  deleteDriveSessionById,
};
