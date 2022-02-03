import mongoose, { Schema, Types, Model } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { ITeslaAccount } from './teslaAccount.model';
import { IPaginator, IToJSON } from './types';
import { IUser } from './user.model';

export interface IVehicle {
  user: Types.ObjectId;
  teslaAccount: string | Types.ObjectId | null;
  collectData: boolean;
  id: number;
  vin: string;
  vehicle_id: number;
  display_name: string;
  option_codes: string;
  access_type: string;
  color: any;
  tokens: string[];
  state: string;
  in_service: boolean;
  id_s: string;
  calendar_enabled: boolean;
  api_version: number;
  backseat_token: any;
  backseat_token_updated_at: any;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    teslaAccount: {
      type: mongoose.SchemaTypes.ObjectId || null,
      ref: 'TeslaAccount',
      default: null,
      autopopulate: false,
    },
    collectData: {
      type: Boolean,
      default: false,
    },
    id: {
      type: Number,
    },
    vin: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_id: {
      type: Number,
    },
    display_name: {
      type: String,
      default: '',
      trim: true,
    },
    option_codes: {
      type: String,
      trim: true,
    },
    access_type: {
      type: String,
    },
    color: {
      type: Schema.Types.Mixed,
    },
    tokens: {
      type: Array,
    },
    state: {
      type: String,
      trim: true,
    },
    in_service: {
      type: Boolean,
    },
    id_s: {
      type: String,
      required: true,
      trim: true,
    },
    calendar_enabled: {
      type: Boolean,
    },
    api_version: {
      type: Number,
    },
    backseat_token: {
      type: Schema.Types.Mixed,
    },
    backseat_token_updated_at: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
vehicleSchema.plugin(toJSON);
vehicleSchema.plugin(paginate);
vehicleSchema.plugin(require('mongoose-autopopulate'));

vehicleSchema.index({ vin: 'text', user: 1 });
vehicleSchema.index({ user: 1 });

/**
 * Check if vehicle is already registered to user
 * @param {string} vin - The vehicles's vin
 * @param {ObjectId} user - The users's id
 * @param {ObjectId} [excludeUserId] - The id of the vehicle to be excluded
 * @returns {Promise<boolean>}
 */
vehicleSchema.statics.isVehicleRegistered = async function (vin: string, user: Types.ObjectId): Promise<boolean> {
  const vehicle = await this.findOne({ vin, user });
  return !!vehicle;
};

interface VehicleModel extends Model<IVehicle>, IPaginator, IToJSON {
  isVehicleRegistered(vin: string, user: Types.ObjectId): boolean;
}
/**
 * @typedef Vehicle
 */
const Vehicle = mongoose.model<IVehicle, VehicleModel>('Vehicle', vehicleSchema);

export default Vehicle;
