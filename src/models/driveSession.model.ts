import mongoose, { Types, Schema, Model } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { GeoJSONPoint, IPaginator, IToJSON } from './types';
import { IVehicleData } from './vehicleData.model';

export interface IDriveSession {
  dataPoints: string[] | Types.ObjectId[] | IVehicleData;
  startDate: Date;
  endDate: Date;
  maxSpeed: number;
  maxPower: number;
  maxRegen: number;
  distance: number;
  startLocation: GeoJSONPoint;
  endLocation: GeoJSONPoint;
  flags: string[] | Types.ObjectId[];
  vehicle: Types.ObjectId;
  user: Types.ObjectId;
}

const driveSession = new Schema<IDriveSession>(
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
    maxSpeed: { type: Number, default: 0 },
    maxPower: { type: Number, default: 0 },
    maxRegen: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    startLocation: {
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
    endLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        default: null,
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
driveSession.plugin(toJSON);
driveSession.plugin(paginate);
driveSession.plugin(require('mongoose-autopopulate'));

driveSession.index({ vehicle: 'text', user: 1 });
driveSession.index({ user: 1 });

driveSession.post('remove', { query: false, document: true }, async (session) => {
  try {
    await mongoose.model('VehicleData').deleteMany({ drive_session_id: session._id });
    return;
  } catch (err) {
    throw new Error('something went wrong post remove of drive session');
  }
});

interface DriveSessionModel extends Model<IDriveSession>, IPaginator, IToJSON {}

const DriveSession = mongoose.model<IDriveSession, DriveSessionModel>('DriveSession', driveSession);

export default DriveSession;
