const mongoose = require('mongoose');
const m2s = require('mongoose-to-swagger');

const vehicleData = mongoose.model('ChargeSession', {
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
});

const swaggerSchema = m2s(vehicleData);
console.log(JSON.stringify(swaggerSchema, null, 2));
