import httpStatus from 'http-status';
import { Vehicle } from '../models';
import ApiError from '../utils/ApiError';

/**
 * Create a vehicle
 * @param {Object} vehicleBody
 * @param {ObjectId} userId
 * @returns {Promise<Vehicle>}
 */
const createVehicle = async (vehicleBody, user, teslaAccount) => {
  if (await Vehicle.isVehicleRegistered(vehicleBody.vin, user)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vehicle already registered');
  }
  return Vehicle.create({ ...vehicleBody, user, teslaAccount });
};

/**
 * Query for vehicles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVehicles = async (filter, options) => {
  const vehicles = await Vehicle.paginate(filter, options);
  return vehicles;
};

/**
 * Get vehicle by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<Vehicle>}
 */
const getVehicleById = async (id, user) => {
  return Vehicle.findOne({ _id: id, user });
};

/**
 * Get vehicle by user id
 * @param {string} userId
 * @returns {Promise<Vehicle[]>}
 */
const getVehiclesByUserId = async (user) => {
  return Vehicle.find({ user });
};

/**
 * Update vehicle by id
 * @param {ObjectId} vehicleId
 * @param {Object} updateBody
 * @returns {Promise<Vehicle>}
 */
const updateVehicleById = async (vehicleId, updateBody, user) => {
  const vehicle = await getVehicleById(vehicleId, user);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  Object.keys(updateBody).forEach((key) => {
    vehicle[key] = updateBody[key];
  });
  await vehicle.save();
  return vehicle;
};

/**
 * Delete vehicle by id
 * @param {ObjectId} vehicleId
 * @returns {Promise<Vehicle>}
 */
const deleteVehicleById = async (vehicleId, user) => {
  const vehicle = await getVehicleById(vehicleId, user);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  await vehicle.remove();
  return vehicle;
};

export default {
  createVehicle,
  queryVehicles,
  getVehicleById,
  getVehiclesByUserId,
  updateVehicleById,
  deleteVehicleById,
};
