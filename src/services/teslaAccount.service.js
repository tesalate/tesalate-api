/* eslint-disable camelcase */
const httpStatus = require('http-status');
const axios = require('axios');
const { TeslaAccount } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

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
  const teslaAccounts = await TeslaAccount.paginate(filter, options);
  return teslaAccounts;
};

/**
 * Get teslaAccount by id
 * @param {ObjectId} id
 * @returns {Promise<TeslaAccount>}
 */
const getTeslaAccountById = async (_id, user) => {
  return TeslaAccount.findOne({ _id, user });
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
 * Link a Tesla Account
 * @param {Object} linkTeslaAccountObject
 * @returns {Promise<TeslaAccount>}
 */
const linkTeslaAccount = async ({ email, refreshToken, user }) => {
  const {
    data: { access_token, refresh_token },
  } = await axios
    .post(`${config.tesla.oauthUrl}/token`, {
      grant_type: 'refresh_token',
      client_id: 'ownerapi',
      refresh_token: refreshToken,
      scope: 'openid email offline_access',
    })
    .catch(() => {
      throw new ApiError(httpStatus.BAD_GATEWAY, 'Request to Tesla Failed');
    });

  try {
    const account = {
      email,
      access_token,
      refresh_token,
      linked: true,
    };

    const teslaAccount = await getTeslaAccountById(user.teslaAccount, user._id);

    if (!teslaAccount) {
      return TeslaAccount.create({ ...account, user: user._id });
    }

    Object.assign(teslaAccount, account);
    await teslaAccount.save();

    return teslaAccount;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  linkTeslaAccount,
  createTeslaAccount,
  queryTeslaAccounts,
  getTeslaAccountById,
  getTeslaAccountByEmail,
  updateTeslaAccountById,
  deleteTeslaAccountById,
};
