const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const chargeSession = mongoose.Schema(
  {
    dataPoints: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CompleteVehicleDataPoint',
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
          type: {
            type: String,
            enum: ['warning', 'error', 'info'],
            default: 'info',
            required: [true, 'Type is required'],
          },
          message: {
            type: String,
            default: '',
            required: [true, 'Message is required'],
          },
        },
      ],
      default: [],
    },
    vid: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vid is required'],
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

chargeSession.index({ vid: 'text', user: 1 });
chargeSession.index({ user: 1 });

chargeSession.post('remove', { query: false, document: true }, async (session) => {
  try {
    await mongoose.model('CompleteVehicleDataPoint').deleteMany({ charge_session_id: session._id });
    return;
  } catch (err) {
    throw new Error('something went wrong', err);
  }
});

/**
 * @typedef ChargeSession
 */
const ChargeSession = mongoose.model('ChargeSession', chargeSession);

module.exports = ChargeSession;
