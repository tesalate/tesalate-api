const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ChargeSession } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Query for charge sessions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryChargeSessions = async (filter, options) => {
  const sessions = await ChargeSession.paginate(filter, options);
  return sessions;
};

/**
 * Get charge session by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<ChargeSession>}
 */
const getChargeSessionById = async (_id, user) => {
  return ChargeSession.findOne({ _id, user });
};

/**
 * Get charge session data by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<ChargeSession>}
 */
const getChargeSessionAggregateById = async (_id, user) => {
  const [chargeSession] = await ChargeSession.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(_id), user } },
    {
      $unwind: {
        path: '$dataPoints',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: 'completevehicledatapoints',
        let: { locator: '$dataPoints' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$locator'] } } },
          {
            $project: {
              _id: 1,
              'charge_state.charger_power': 1,
              'charge_state.charge_miles_added_rated': 1,
              'charge_state.charge_energy_added': 1,
              'charge_state.fast_charger_type': 1,
              'charge_state.timestamp': 1,
              'charge_state.battery_level': 1,
              'charge_state.usable_battery_level': 1,
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
    { $sort: { 'populated.charge_state.timestamp': 1 } },
    {
      $group: {
        _id: '$_id',
        data: { $push: '$populated.charge_state' },
        startDate: { $first: '$startDate' },
        endDate: { $first: '$endDate' },
        batteryLevel: { $push: '$populated.charge_state.battery_level' },
        usableBatteryLevel: { $push: '$populated.charge_state.usable_battery_level' },
        chargerPower: { $push: '$populated.charge_state.charger_power' },
        labels: { $push: '$populated.charge_state.timestamp' },
        exTemp: { $push: '$populated.climate_state.outside_temp' },
        inTemp: { $push: '$populated.climate_state.inside_temp' },
      },
    },
    {
      $project: {
        graphData: {
          datasets: [
            { label: 'battery level', data: '$batteryLevel' },
            { label: 'usable battery level', data: '$usableBatteryLevel' },
            { label: 'charger power', data: '$chargerPower' },
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
          supercharger: {
            value: { $in: ['Tesla', '$data.fast_charger_type'] },
            displayName: 'supercharger',
            displayOrder: 8,
            unit: '',
            displayType: 'bool',
          },
          maxPower: {
            value: { $max: '$data.charger_power' },
            displayName: 'max power',
            displayOrder: 3,
            unit: ' kW',
            displayType: '',
          },
          avgPower: {
            value: { $trunc: [{ $avg: '$data.charger_power' }, 2] },
            displayName: 'average power',
            displayOrder: 4,
            unit: ' kW',
            displayType: '',
          },
          fromTo: {
            value: {
              $concat: [
                { $toString: { $arrayElemAt: ['$data.battery_level', 0] } },
                '% -> ',
                { $toString: { $arrayElemAt: ['$data.battery_level', -1] } },
              ],
            },
            displayName: 'from -> to',
            displayOrder: 2,
            unit: '%',
            displayType: '',
          },
          energyAdded: {
            value: { $max: '$data.charge_energy_added' },
            displayName: 'energy added',
            displayOrder: 7,
            unit: ' kWh',
            displayType: '',
          },
          milesAdded: {
            value: { $max: '$data.charge_miles_added_rated' },
            displayName: 'miles added',
            displayOrder: 5,
            unit: ' miles',
            displayType: '',
          },
          duration: {
            value: { $subtract: [{ $arrayElemAt: ['$data.timestamp', -1] }, { $arrayElemAt: ['$data.timestamp', 0] }] },
            displayName: 'duration',
            displayOrder: 6,
            unit: '',
            displayType: 'duration',
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
        },
      },
    },
  ]);
  return chargeSession;
};

/**
 * Get charge session by user id
 * @param {string} user
 * @returns {Promise<ChargeSession>}
 */
const getChargeSessionByUserId = async (user) => {
  return ChargeSession.find({ user });
};

/**
 * Delete charge session by id
 * @param {ObjectId} chargeSessionPointId
 * @param {ObjectId} user
 * @returns {Promise<ChargeSession>}
 */
const deleteChargeSessionById = async (chargeSessionPointId, user) => {
  const chargeSession = await getChargeSessionById(chargeSessionPointId, user);
  if (!chargeSession) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChargeSession not found');
  }
  await chargeSession.remove();
  return chargeSession;
};

module.exports = {
  queryChargeSessions,
  getChargeSessionById,
  getChargeSessionAggregateById,
  getChargeSessionByUserId,
  deleteChargeSessionById,
};
