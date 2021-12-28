const httpStatus = require('http-status');
const { VehicleData } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Query for vehicle data points
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVehicleDataPoints = async (filter, options) => {
  const vehicles = await VehicleData.paginate(filter, options);
  return vehicles;
};

/**
 * Get vehicle data point by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<VehicleData>}
 */
const getVehicleDataPointById = async (id, user) => {
  return VehicleData.findOne({ _id: id, user });
};

/**
 * Delete vehicle data point by id
 * @param {ObjectId} vehicleDataPointId
 * @param {ObjectId} user
 * @returns {Promise<VehicleData>}
 */
const deleteVehicleDataPointById = async (vehicleDataPointId, user) => {
  const vehicleData = await getVehicleDataPointById(vehicleDataPointId, user);
  if (!vehicleData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'VehicleData not found');
  }
  await vehicleData.remove();
  return vehicleData;
};

module.exports = {
  queryVehicleDataPoints,
  getVehicleDataPointById,
  deleteVehicleDataPointById,
};
