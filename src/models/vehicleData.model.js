const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const vehicleData = mongoose.Schema(
  {
    id: {
      type: Number,
    },
    user_id: {
      type: Number,
    },
    vehicle_id: {
      type: Number,
    },
    vin: {
      type: String,
    },
    display_name: {
      type: String,
    },
    option_codes: {
      type: String,
    },
    color: {
      default: null,
      type: mongoose.Mixed,
    },
    access_type: {
      type: String,
    },
    tokens: {
      type: Array,
    },
    state: {
      type: String,
    },
    in_service: {
      type: Boolean,
    },
    id_s: {
      type: String,
    },
    calendar_enabled: {
      type: Boolean,
    },
    api_version: {
      type: Number,
    },
    backseat_token: {
      default: null,
      type: mongoose.Mixed,
    },
    backseat_token_updated_at: {
      default: null,
      type: mongoose.Mixed,
    },
    charge_state: {
      type: Map,
    },
    climate_state: {
      type: Map,
    },
    drive_state: {
      type: Map,
    },
    gui_settings: {
      type: Map,
    },
    vehicle_config: {
      type: Map,
    },
    vehicle_state: {
      type: Map,
    },
    timestamp: {
      type: Number,
    },
    valet_mode: {
      type: Boolean,
    },
    drive_session_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'DriveSession',
      default: null,
      autopopulate: false,
    },
    charge_session_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'ChargeSession',
      default: null,
      autopopulate: false,
    },
    speed: {
      type: Array,
      default: [],
    },
    power: {
      type: Array,
      default: [],
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
    vehicle: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Vehicle',
      required: true,
      autopopulate: false,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
vehicleData.plugin(toJSON);
vehicleData.plugin(paginate);

vehicleData.index({ vin: 'text', user: 1 });
vehicleData.index({ _id: -1, user: 1 });
vehicleData.index({ user: 1 });
vehicleData.index({ GeoJSON: '2dsphere', user: 1 });

/**
 * @typedef VehicleData
 */
const VehicleData = mongoose.model('VehicleData', vehicleData, 'vehicledata');

module.exports = VehicleData;
