import httpStatus from 'http-status';
import { getDistance } from 'geolib';
import { MapPoint } from '../models';
import ApiError from '../utils/ApiError';
import { IMapPoint } from '../models/mapPoint.model';
import { GeolibGeoJSONPoint } from 'geolib/es/types';
import VehicleData from '../models/vehicleData.model';
import logger from '../config/logger';
import { performance } from 'node:perf_hooks';

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
 * Get map point by vehicle id
 * @param {ObjectId} vehicle
 * @param {ObjectId} user
 * @returns {Promise<MapPoint>}
 */
const getMapPointByVid = async (vehicle, user) => {
  return MapPoint.find({ vehicle, user });
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

const dateFromObjectId = function (objectId) {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

/**
 * Get map point data by id
 * @param {number} km
 * @param {ObjectId} vehicle
 * @returns {Promise<MapPoint[]>}
 */

const getMapPointsByDistanceApart = async (km, vehicle, user, mostRecent) => {
  let itt = 0;
  const kmInt = parseInt(km, 10) * 1000;

  if (!mostRecent) {
    mostRecent = (await VehicleData.find({ vehicle, user }).sort({ $natural: -1 }).select('geoJSON').limit(1))[0];
  } else {
    mostRecent = JSON.parse(mostRecent);
  }
  const a = performance.now();

  const mostRecentMapPoint = await MapPoint.find({
    vehicle,
    user,
    geoJSON: {
      $nearSphere: {
        $geometry: mostRecent['geoJSON'],
        $maxDistance: 10,
      },
    },
  })
    .populate({ path: 'dataPoints', select: '_id drive_state.heading drive_state.latitude drive_state.longitude' })
    .lean()
    .select('_id dataPoints latLongString visitCount')
    .limit(1);

  let mapPoints = await MapPoint.find({
    vehicle,
    user,
    geoJSON: {
      $nearSphere: {
        $geometry: mostRecent['geoJSON'],
        $minDistance: kmInt,
      },
    },
  })
    // .sort({ updatedAt: -1 })
    .populate({ path: 'dataPoints', select: '_id drive_state.heading drive_state.latitude drive_state.longitude' })
    .lean()
    .select('_id dataPoints latLongString visitCount');
  const b = performance.now();
  logger.info(`DB QUERY TIME: ${(b - a) / 1000}`);
  mapPoints = [...mostRecentMapPoint, ...mapPoints];
  const c = performance.now();

  const returnArr = mapPoints.reduce((acc: IMapPoint[], curr) => {
    const { drive_state: latLong } = curr.dataPoints[0];

    if (acc.length === 0) {
      return [...acc, curr];
    }

    let save = true;

    for (let i = acc.length - 1; i >= 0; i -= 1) {
      itt++;

      if (getDistance(acc[i]['dataPoints'][0]['drive_state'], latLong) <= kmInt) {
        save = false;
        break;
      }
    }

    if (!save) return acc;

    return [...acc, curr];
  }, []);
  const d = performance.now();
  logger.info(`FOR LOOP TIME ${(d - c) / 1000}`);
  logger.info(`getMapPointsByDistanceApart iterations: ${itt}`, { km });
  return returnArr;
};

export default {
  queryMapPoints,
  getMapPointById,
  getMapPointsByDistanceApart,
  deleteMapPointById,
};
