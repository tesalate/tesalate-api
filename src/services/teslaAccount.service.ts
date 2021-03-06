/* eslint-disable camelcase */
import httpStatus from 'http-status';
import axios from 'axios';
import { TeslaAccount, Vehicle } from '../models';
import ApiError from '../utils/ApiError';
import config from '../config/config';
import { vehicleService } from '.';

/**
 * Create a teslaAccount
 * @param {Object} teslaAccountBody
 * @returns {Promise<TeslaAccount>}
 */
const createTeslaAccount = async (teslaAccountBody) => {
  if (await TeslaAccount.isEmailTaken(teslaAccountBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return TeslaAccount.create(teslaAccountBody);
};

/**
 * Query for teslaAccounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTeslaAccounts = async (filter, options) => {
  const teslaAccounts = await TeslaAccount.paginate(filter, { ...options, populate: 'vehicles' });
  return teslaAccounts;
};

/**
 * Get teslaAccount by id
 * @param {ObjectId} id
 * @returns {Promise<TeslaAccount>}
 */
const getTeslaAccountById = async (_id, user) => {
  return TeslaAccount.findOne({ _id, user }).populate('vehicles');
};

/**
 * Get teslaAccount by email
 * @param {string} email
 * @returns {Promise<TeslaAccount>}
 */
const getTeslaAccountByEmail = async (email, user) => {
  return TeslaAccount.findOne({ email, user });
};

/**
 * Update teslaAccount by id
 * @param {ObjectId} teslaAccountId
 * @param {Object} updateBody
 * @returns {Promise<TeslaAccount>}
 */
const updateTeslaAccountById = async (teslaAccountId, updateBody, user) => {
  const teslaAccount = await getTeslaAccountById(teslaAccountId, user);
  if (!teslaAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tesla Account not found');
  }
  if (updateBody.email && (await TeslaAccount.isEmailTaken(updateBody.email, teslaAccountId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(teslaAccount, updateBody);
  await teslaAccount.save();
  return teslaAccount;
};

/**
 * Delete teslaAccount by id
 * @param {ObjectId} teslaAccountId
 * @returns {Promise<TeslaAccount>}
 */
const deleteTeslaAccountById = async (teslaAccountId, user) => {
  const teslaAccount = await getTeslaAccountById(teslaAccountId, user);
  if (!teslaAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tesla Account not found');
  }
  await teslaAccount.remove();
  return teslaAccount;
};

/**
 * login a Tesla Account
 * @param {Object} linkTeslaAccountObject
 * @returns {Promise<TeslaAccount>}
 */
const linkTeslaAccount = async ({ email, refreshToken, user }) => {
  const { data: bearerTokenData } = await axios.post(`${config.tesla.oauthUrl}/token`, {
    grant_type: 'refresh_token',
    client_id: 'ownerapi',
    refresh_token: refreshToken,
    scope: 'openid email offline_access',
  });

  // const { data: ownerTokenData } = await axios.post(
  //   `${config.tesla.ownerUrl}/oauth/token`,
  //   {
  //     grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  //     client_id: config.tesla.clientId,
  //     client_secret: config.tesla.clientSecret,
  //   },
  //   {
  //     headers: {
  //       Authorization: `Bearer ${bearerTokenData.access_token}`,
  //       'Content-Type': 'application/json',
  //       'User-Agent': 'TeslaAPI-proxy/2.0 (Node.js)',
  //     },
  //   }
  // );

  try {
    const account = {
      email,
      access_token: bearerTokenData.access_token,
      refresh_token: bearerTokenData.refresh_token,
      linked: true,
    };

    const teslaAccount = await getTeslaAccountById(user.teslaAccount, user._id);

    if (!teslaAccount) {
      return TeslaAccount.create({ ...account, user: user._id });
    }

    Object.assign(teslaAccount, account);
    const updatedAccount = await teslaAccount.save();

    return updatedAccount;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

/**
 * Get and Set Vehicles from Tesla
 * @param {Object} linkTeslaAccountObject
 * @returns {Promise<TeslaAccount>}
 */
const getAndSetVehiclesFromTesla = async ({ accessToken, user, teslaAccount }) => {
  const {
    data: { response: vehicles },
  } = await axios
    .get(`${config.tesla.ownerUrl}/api/1/vehicles`, { headers: { Authorization: `Bearer ${accessToken}` } })
    .catch((error) => {
      throw new ApiError(httpStatus.BAD_GATEWAY, `Request to Tesla Failed ${error}`);
    });

  try {
    const userVehicles = await vehicleService.getVehiclesByUserId(user._id);

    // Loop through userVehicles
    // If vehicle not in tesla vehicle response =>  teslaAccount = null collectData = false
    await Promise.all(
      userVehicles
        .filter((curr) => !vehicles.find((teslaVehicle) => teslaVehicle.vin === curr.vin) && curr.teslaAccount)
        .map((vehicle) =>
          Vehicle.updateOne({ vin: vehicle.vin, user }, { teslaAccount: null, collectData: false }, { upsert: true })
        )
    );
    await Promise.all(
      vehicles.map((vehicle) =>
        Vehicle.updateOne({ vin: vehicle.vin, user, teslaAccount }, { ...vehicle, collectData: false }, { upsert: true })
      )
    );

    const updatedVehicles = await vehicleService.getVehiclesByUserId(user._id);
    return updatedVehicles;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

export default {
  linkTeslaAccount,
  getAndSetVehiclesFromTesla,
  createTeslaAccount,
  queryTeslaAccounts,
  getTeslaAccountById,
  getTeslaAccountByEmail,
  updateTeslaAccountById,
  deleteTeslaAccountById,
};
