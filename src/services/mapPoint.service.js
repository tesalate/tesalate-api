const httpStatus = require('http-status');
const geolib = require('geolib');
const { MapPoint } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Query for map points
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMapPoints = async (filter, options) => {
  const mapPoints = await MapPoint.paginate(filter, options);
  return mapPoints;
};

/**
 * Get map point by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<MapPoint>}
 */
const getMapPointById = async (_id, user) => {
  return MapPoint.findOne({ _id, user });
};

/**
 * Get map point by user id
 * @param {string} user
 * @returns {Promise<MapPoint>}
 */
const getMapPointByUserId = async (user) => {
  return MapPoint.find({ user });
};

/**
 * Delete map point by id
 * @param {ObjectId} mapPointPointId
 * @param {ObjectId} user
 * @returns {Promise<MapPoint>}
 */
const deleteMapPointById = async (mapPointPointId, user) => {
  const mapPoint = await getMapPointById(mapPointPointId, user);
  if (!mapPoint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MapPoint not found');
  }
  await mapPoint.remove();
  return mapPoint;
};

/**
 * Get map point data by id
 * @param {number} km
 * @param {ObjectId} user
 * @returns {Promise<MapPoint[]>}
 */
const getMapPointsByDistanceApart = async (km, user) => {
  const mapPoints = await getMapPointByUserId(user);
  const geoPoints = [];
  return mapPoints.reduce((acc, curr) => {
    const { geoJSON, ...rest } = curr;
    const latLong = rest.dataPoints[0].drive_state;
    if (geoPoints.length === 0) {
      geoPoints.push(latLong);
      return [...acc, rest];
    }
    let save = true;
    for (let i = geoPoints.length - 1; i >= 0; i -= 1) {
      if (geolib.getDistance(geoPoints[i], latLong) <= parseInt(km, 10) * 1000) {
        save = false;
        break;
      }
    }
    if (!save) return [...acc];
    geoPoints.push(latLong);
    return [...acc, rest];
  }, []);
};

module.exports = {
  queryMapPoints,
  getMapPointById,
  getMapPointsByDistanceApart,
  getMapPointByUserId,
  deleteMapPointById,
};
