const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const flagSchema = mongoose.Schema(
  {
    systemName: {
      type: String,
      required: [true, 'Unique name is required'],
      unique: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info',
      required: [true, 'Type is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
flagSchema.plugin(toJSON);
flagSchema.index({ id: 1 });

/**
 * @typedef Flag
 */
const Flag = mongoose.model('Flag', flagSchema);

module.exports = Flag;
