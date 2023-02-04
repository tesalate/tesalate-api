import mongoose, { Schema, Model } from 'mongoose';
import { GeoJSONPoint, IPaginator, IToJSON } from './types';
import { paginate, toJSON } from './plugins';

export enum SessionType {
  idle = 'idle',
  drive = 'drive',
  sleep = 'sleep',
  charge = 'charge',
  sentry = 'sentry',
  conditioning = 'conditioning',
}

export interface ISession extends IPaginator, IToJSON {
  _id: string | mongoose.Types.ObjectId;
  dataPoints: string[];
  createdAt: Date;
  updatedAt: Date;
  startLocation: GeoJSONPoint;
  endLocation: GeoJSONPoint;
  flags: string[];
  vehicle: string;
  user: string;
  type: SessionType;
}

const sessionSchema = new Schema<ISession>({
  dataPoints: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'VehicleData',
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: null,
    },
    coordinates: {
      type: [Number],
      default: null,
    },
  },
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: null,
    },
    coordinates: {
      type: [Number],
      default: null,
    },
  },
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: {
      type: String,
      enum: Object.values(SessionType),
      required: true,
    },
  },
  metadata: {
    default: {},
    type: Schema.Types.Mixed,
  },
  sessionData: {
    default: {},
    type: Schema.Types.Mixed,
  },
});

// add plugin that converts mongoose to json
sessionSchema.plugin(toJSON);
sessionSchema.plugin(paginate);

sessionSchema.index({ _id: -1, vehicle: 1, user: 1, type: 1 });

interface SessionModel extends Model<ISession>, IPaginator, IToJSON {}

/**
 * @typedef Session
 */
const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
