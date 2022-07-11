import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Settings } from '../models';
import { ISettings } from '../models/settings.model';
import ApiError from '../utils/ApiError';
import { mergeWith } from 'lodash';

/**
 * Create a settings
 * @param {Object} settingsBody
 * @returns {Promise<ISettings>}
 */
const createSettings = async (settingsBody: ISettings): Promise<ISettings> => {
  if (await Settings.hasSettings(settingsBody.user as mongoose.Types.ObjectId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Settings already set');
  }
  return Settings.create(settingsBody);
};

/**
 * Get settings by id
 * @param {ObjectId} id
 * @returns {Promise<Settings>}
 */
const getSettingsByUserId = async (user, isMobile?) => {
  return Settings.findOne({ user }).select(isMobile !== undefined ? (isMobile ? 'mobile' : 'desktop') : '');
};

/**
 * Get settings by id
 * @param {ObjectId} id
 * @returns {Promise<ISettings>}
 */
const getSettingsById = async (id) => {
  return Settings.findById(id);
};

/**
 * Update settings by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<ISettings>}
 */

function customAssign(obj1, obj2) {
  const result = {};

  // based on the fact that obj2 has a subset of keys of obj1
  Object.getOwnPropertyNames(obj1).forEach((key) => {
    const attr1 = obj1[key],
      attr2 = obj2[key],
      itemLookup = {};

    if (Array.isArray(attr1) && Array.isArray(attr2)) {
      // based on the fact that the collection of an attribute
      // of obj2 a subset of the same attribue at obj1
      attr2.forEach((item) => (itemLookup[item.name] = item));
      result[key] = attr1.map((item1) => {
        const item2 = itemLookup[item1.name];
        if (item2 && item2.check) return item2;
        return item1;
      });
    } else {
      result[key] = attr2 || attr1;
    }
  });

  return result;
}

function convertToDotNotation(obj, newObj = {}, prefix = '') {
  for (const key in obj) {
    if (obj[key] === null) {
      newObj[prefix + key] = undefined;
    } else if (typeof obj[key] === 'object') {
      convertToDotNotation(obj[key], newObj, prefix + key + '.');
    } else {
      newObj[prefix + key] = obj[key];
    }
  }

  return newObj;
}

const updateSettingsById = async (userId, updateBody) => {
  await Settings.updateOne(
    {
      user: userId,
    },
    {
      ...convertToDotNotation(updateBody),
    },
    { new: true, upsert: true }
  );
  return;
};

/**
 * Delete settings by id
 * @param {ObjectId} userId
 * @returns {Promise<Settings>}
 */
const deleteSettingsById = async (userId) => {
  const settings = await getSettingsByUserId(userId);
  if (!settings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Settings not found');
  }
  await settings.remove();
  return settings;
};

export default {
  createSettings,
  getSettingsByUserId,
  getSettingsById,
  updateSettingsById,
  deleteSettingsById,
};
