import httpStatus from 'http-status';
import { getDistance } from 'geolib';
import { MapPoint } from '../models';
import ApiError from '../utils/ApiError';
import { IMapPoint } from '../models/mapPoint.model';
import { GeolibGeoJSONPoint } from 'geolib/es/types';

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

const getMapPointsByDistanceApart = async (km, vehicle, user) => {
  const mapPoints = await MapPoint.find({ vehicle, user })
    .select('_id dataPoints latLongString visitCount')
    .sort({ updatedAt: -1 });

  const geoPoints: Partial<IMapPoint>[] = [];
  const returnArr = mapPoints.reduce((acc: Partial<IMapPoint>[], curr) => {
    const { drive_state: latLong } = curr.dataPoints[0].toJSON();

    if (geoPoints.length === 0) {
      geoPoints.push(latLong);
      return [...acc, curr];
    }

    let save = true;

    for (let i = geoPoints.length - 1; i >= 0; i -= 1) {
      if (getDistance(geoPoints[i] as GeolibGeoJSONPoint, latLong) <= parseInt(km, 10) * 1000) {
        save = false;
        break;
      }
    }

    if (!save) return acc;

    geoPoints.push(latLong);
    return [...acc, curr];
  }, []);
  return returnArr;
};

export default {
  queryMapPoints,
  getMapPointById,
  getMapPointsByDistanceApart,
  deleteMapPointById,
};
