import mongoose, { Schema, Types, Model } from 'mongoose';
import { toJSON } from './plugins';
import { IToJSON } from './types';
import { IUser } from './user.model';

export interface ISettings extends IToJSON {
  user: IUser['_id'] | string;
  desktop: Record<any, any>;
  mobile: Record<any, any>;
}

const settingsSchema = new Schema<ISettings>({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  desktop: {
    type: Object,
    default: {
      ui: {
        type: Object,
        default: {},
      },
    },
  },
  mobile: {
    type: Object,
    default: {
      ui: {
        type: Object,
        default: {},
      },
    },
  },
});

// add plugin that converts mongoose to json
settingsSchema.plugin(toJSON);
settingsSchema.index({ user: 1 });

/**
 * Check if settings is already set to user
 * @param {ObjectId} user - The users' id
 * @returns {Promise<boolean>}
 */
settingsSchema.statics.hasSettings = async function (user: Types.ObjectId): Promise<boolean> {
  const settings = await this.findOne({ user });
  return !!settings;
};

interface SettingsModel extends Model<ISettings>, IToJSON {
  hasSettings(user: Types.ObjectId): boolean;
}

/**
 * @typedef Settings
 */
const Settings = mongoose.model<ISettings, SettingsModel>('Settings', settingsSchema);

export default Settings;
