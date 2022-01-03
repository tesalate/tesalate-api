const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const reminder = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['odometer', 'date'],
    },
    message: {
      type: String,
      required: true,
      default: '',
    },
    when: {
      type: Number || Date,
      required: true,
    },
    remindWithin: {
      type: Number,
    },
    completed: {
      type: Boolean,
      default: false,
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
reminder.plugin(toJSON);
reminder.plugin(paginate);

reminder.index({ vehicle: 'text', user: 1 });
reminder.index({ user: 1 });

/**
 * @typedef Reminder
 */
const Reminder = mongoose.model('Reminder', reminder);

module.exports = Reminder;
