const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const driveSession = mongoose.Schema(
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
    throw new Error('something went wrong post remove of drive session', err);
  }
});

/**
 * @typedef DriveSession
 */
const DriveSession = mongoose.model('DriveSession', driveSession);

module.exports = DriveSession;
