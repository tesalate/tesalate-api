import mongoose, { Schema, Types, Model } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { GeoJSONPolygon, IToJSON, IPaginator } from './types';
import { IVehicleData } from './vehicleData.model';

export interface IMapPoint {
  dataPoints: string[] | Types.ObjectId[] | IVehicleData;
  visitCount: number;
  latLongString: string;
  geoJSON: GeoJSONPolygon;
  vehicle: string | Types.ObjectId;
  user: string | Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const mapPoint = new Schema<IMapPoint>(
  {
    dataPoints: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'VehicleData',
          autopopulate: { select: '_id drive_state.longitude drive_state.latitude drive_state.heading' },
        },
      ],
      default: [],
    },
    visitCount: {
      type: Number,
      default: 1,
    },
    latLongString: {
      type: String,
      required: true,
    },
    geoJSON: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
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
mapPoint.plugin(toJSON);
mapPoint.plugin(paginate);
mapPoint.plugin(require('mongoose-autopopulate'));

mapPoint.index({ vehicle: 'text', user: 1 });
mapPoint.index({ user: 1 });

interface MapPointModel extends Model<IMapPoint>, IPaginator, IToJSON {}

/**
 * @typedef MapPoint
 */
const MapPoint = mongoose.model<IMapPoint, MapPointModel>('MapPoint', mapPoint);

export default MapPoint;
