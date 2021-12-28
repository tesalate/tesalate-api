const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const mapPoint = mongoose.Schema(
  {
    dataPoints: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CompleteVehicleDataPoint',
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
    vid: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vid is required'],
      autopopulate: { select: '_id' },
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      autopopulate: { select: '_id' },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
mapPoint.plugin(toJSON);
mapPoint.plugin(paginate);

mapPoint.index({ vid: 'text', user: 1 });
mapPoint.index({ user: 1 });

/**
 * @typedef MapPoint
 */
const MapPoint = mongoose.model('MapPoint', mapPoint);

module.exports = MapPoint;
