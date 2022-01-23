import mongoose, { Schema, Types, Model } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { GeoJSONPoint, IPaginator, IToJSON } from './types';
import { IVehicleData } from './vehicleData.model';

export interface IChargeSession {
  dataPoints: string[] | Types.ObjectId[] | IVehicleData;
  startDate: Date;
  endDate: Date;
  maxChargeRate: number;
  energyAdded: number;
  charger: Types.ObjectId;
  geoJSON: GeoJSONPoint;
  flags: string[] | Types.ObjectId[];
  vehicle: Types.ObjectId;
  user: Types.ObjectId;
}

const chargeSession = new Schema<IChargeSession>(
  {
    dataPoints: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'VehicleData',
          autopopulate: false,
        },
      ],
      default: [],
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    maxChargeRate: { type: Number, default: 0 },
    energyAdded: { type: Number, default: 0 },
    charger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charger',
      default: null,
    },
    geoJSON: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    flags: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Flag',
          autopopulate: true,
        },
      ],
      default: [],
    },
    vehicle: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Vehicle',
      required: [true, 'vehicle is required'],
      autopopulate: false,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      autopopulate: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chargeSession.plugin(toJSON);
chargeSession.plugin(paginate);
/* tslint-ignore */
chargeSession.plugin(require('mongoose-autopopulate'));

chargeSession.index({ vehicle: 'text', user: 1 });
chargeSession.index({ user: 1 });

chargeSession.post('remove', { query: false, document: true }, async (session) => {
  try {
    await mongoose.model('VehicleData').deleteMany({ charge_session_id: session._id });
    return;
  } catch (err) {
    throw new Error('something went wrong post save for charge session');
  }
});

interface ChargeSessionModel extends Model<IChargeSession>, IPaginator, IToJSON {}

/**
 * @typedef ChargeSession
 */
const ChargeSession = mongoose.model<IChargeSession, ChargeSessionModel>('ChargeSession', chargeSession);

export default ChargeSession;
