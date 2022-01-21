const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const vehicleSchema = mongoose.Schema(
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
      type: mongoose.Mixed,
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
      type: mongoose.Mixed,
    },
    backseat_token_updated_at: {
      type: mongoose.Mixed,
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

vehicleSchema.post('save', async (vehicle) => {
  try {
    await mongoose.model('User').updateOne({ _id: vehicle.user }, { $addToSet: { vehicles: vehicle._id } });
  } catch (err) {
    throw new Error('something went wrong post save of vehicle', err.message);
  }
});

vehicleSchema.post('save', async (vehicle) => {
  try {
    await mongoose.model('TeslaAccount').updateOne({ _id: vehicle.teslaAccount }, { $addToSet: { vehicles: vehicle._id } });
  } catch (err) {
    throw new Error('something went wrong post save of vehicle', err.message);
  }
});

vehicleSchema.post('remove', { query: false, document: true }, async (vehicle) => {
  try {
    const user = await mongoose.model('User').findById(vehicle.user);
    user.vehicles.pull(vehicle._id);
    return user.save();
  } catch (err) {
    throw new Error('something went wrong post remove of vehicle for user', err);
  }
});

vehicleSchema.post('remove', { query: false, document: true }, async (vehicle) => {
  try {
    const teslaAccount = await mongoose.model('TeslaAccount').findById(vehicle.teslaAccount);

    teslaAccount.vehicles.pull(vehicle._id);
    return teslaAccount.save();
  } catch (err) {
    throw new Error('something went wrong post remove of vehicle for tesla account', err);
  }
});

/**
 * Check if vehicle is already registered to user
 * @param {string} vin - The vehicles's vin
 * @param {ObjectId} user - The users's id
 * @param {ObjectId} [excludeUserId] - The id of the vehicle to be excluded
 * @returns {Promise<boolean>}
 */
vehicleSchema.statics.isVehicleRegistered = async function (vin, user) {
  const vehicle = await this.findOne({ vin, user });
  return !!vehicle;
};

/**
 * @typedef Vehicle
 */
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
